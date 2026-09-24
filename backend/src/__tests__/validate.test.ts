import { z } from 'zod';
import { validateBody, validateQuery } from '../middleware/validate';
import { Request, Response, NextFunction } from 'express';

describe('Zod Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const sampleSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 chars'),
    email: z.string().email('Invalid email address'),
    count: z.number().int().positive().optional(),
  });

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validateBody', () => {
    const middleware = validateBody(sampleSchema);

    it('should call next() and assign parsed data on valid body', () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        count: 5,
      };

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockReq.body).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        count: 5,
      });
    });

    it('should return 400 with details when required fields are missing', () => {
      mockReq.body = {
        name: 'J', // too short
        // email is missing
      };

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'email' }),
          ]),
        })
      );
    });

    it('should strip unknown fields when schema is strict or not explicitly passthrough', () => {
      mockReq.body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        unexpectedField: 'malicious payload',
      };

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect((mockReq.body as any).unexpectedField).toBeUndefined();
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number),
      limit: z.string().regex(/^\d+$/).transform(Number),
    });

    const queryMiddleware = validateQuery(querySchema);

    it('should transform and validate query parameters', () => {
      mockReq.query = { page: '2', limit: '25' };

      queryMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect((mockReq as any).validatedQuery).toEqual({ page: 2, limit: 25 });
    });

    it('should reject non-numeric pagination parameters', () => {
      mockReq.query = { page: 'invalid', limit: '25' };

      queryMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
