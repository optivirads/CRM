import { requireAuth, requireRole, requireOwner, requireOwnerOrRole, generateToken } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';

describe('Auth & Role/Owner Authorization Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('requireAuth', () => {
    it('should reject request without Authorization header with 401', async () => {
      await requireAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Authentication token required',
        })
      );
    });

    it('should reject invalid or tampered JWT token with 401', async () => {
      mockReq.headers = { authorization: 'Bearer invalid.tampered.token' };
      await requireAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid or expired authentication token',
        })
      );
    });

    it('should pass and attach user payload for valid JWT', async () => {
      const payload: AuthenticatedUser = {
        id: 'u-123',
        email: 'admin@optivir.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        organizationId: '',
        isOwner: false,
      };
      const token = generateToken(payload);
      mockReq.headers = { authorization: `Bearer ${token}` };

      await requireAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe('u-123');
      expect(mockReq.user?.email).toBe('admin@optivir.com');
    });
  });

  describe('requireRole', () => {
    it('should allow user possessing the required role', () => {
      mockReq.user = {
        id: 'u-1',
        email: 'u1@test.com',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'Super Admin',
        isOwner: false,
        organizationId: 'org-1',
      };
      const middleware = requireRole('Super Admin', 'Admin');

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should forbid user without required role with 403', () => {
      mockReq.user = {
        id: 'u-2',
        email: 'u2@test.com',
        firstName: 'Test',
        lastName: 'Sales',
        role: 'Sales Rep',
        isOwner: false,
        organizationId: 'org-1',
      };
      const middleware = requireRole('Super Admin', 'Admin');

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('requires one of the following roles'),
        })
      );
    });
  });

  describe('requireOwner (Ownership is distinct from Role)', () => {
    it('should allow user if isOwner is true', () => {
      mockReq.user = {
        id: 'u-owner',
        email: 'owner@test.com',
        firstName: 'Org',
        lastName: 'Owner',
        role: 'Admin',
        isOwner: true,
        organizationId: 'org-1',
      };

      requireOwner(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should forbid user if isOwner is false, even if role is Super Admin or Admin', () => {
      mockReq.user = {
        id: 'u-admin',
        email: 'admin@test.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'Super Admin',
        isOwner: false,
        organizationId: 'org-1',
      };

      requireOwner(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('restricted to the organization owner'),
        })
      );
    });
  });

  describe('requireOwnerOrRole', () => {
    it('should allow user if user is owner even if role does not match', () => {
      mockReq.user = {
        id: 'u-owner',
        email: 'owner@test.com',
        firstName: 'Org',
        lastName: 'Owner',
        role: 'Viewer',
        isOwner: true,
        organizationId: 'org-1',
      };
      const middleware = requireOwnerOrRole('Admin');

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should allow non-owner user if role matches', () => {
      mockReq.user = {
        id: 'u-admin',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        isOwner: false,
        organizationId: 'org-1',
      };
      const middleware = requireOwnerOrRole('Admin');

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should reject non-owner user whose role does not match', () => {
      mockReq.user = {
        id: 'u-sales',
        email: 'sales@test.com',
        firstName: 'Sales',
        lastName: 'Person',
        role: 'Sales Rep',
        isOwner: false,
        organizationId: 'org-1',
      };
      const middleware = requireOwnerOrRole('Admin');

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Insufficient permissions'),
        })
      );
    });
  });
});
