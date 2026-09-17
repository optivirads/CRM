import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

/**
 * Middleware factory: validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (and type-coerced) data.
 * On failure, returns 400 with a structured error list.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = formatZodErrors(result.error);
      const detailedMessage = errors.map(e => e.message).join('. ') || 'Validation failed';
      res.status(400).json({
        success: false,
        message: detailedMessage,
        errors
      });
    }
  };
}

/**
 * Middleware factory: validates req.query against a Zod schema.
 */
export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (result.success) {
      (req as any).validatedQuery = result.data;
      next();
    } else {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }
  };
}

function formatZodErrors(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((e) => ({
    field: e.path.join('.') || 'body',
    message: e.message
  }));
}
