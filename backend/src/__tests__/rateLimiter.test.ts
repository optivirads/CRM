import { createRateLimiter } from '../middleware/rateLimiter';
import { Request, Response, NextFunction } from 'express';

describe('Rate Limiter Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '192.168.1.100',
      headers: {},
      socket: { remoteAddress: '192.168.1.100' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should allow requests within limit', () => {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 3,
      message: 'Too many requests',
    });

    limiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    limiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    limiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(3);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should block requests exceeding the max limit with 429', () => {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 2,
      message: 'Rate limit exceeded',
    });

    limiter(mockReq as Request, mockRes as Response, mockNext);
    limiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    // 3rd attempt exceeds limit of 2
    limiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Rate limit exceeded',
      })
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });

  it('should track different IPs independently', () => {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 1,
      message: 'Rate limit exceeded',
    });

    const req1 = { ip: '10.0.0.1', headers: {}, socket: { remoteAddress: '10.0.0.1' } } as any;
    const req2 = { ip: '10.0.0.2', headers: {}, socket: { remoteAddress: '10.0.0.2' } } as any;

    limiter(req1, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Different IP should still be allowed
    limiter(req2, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);

    // First IP exceeding
    limiter(req1, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(429);
  });
});
