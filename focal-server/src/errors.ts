import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request fields.',
      fields: [...new Set(error.issues.map(issue => issue.path.join('.') || 'body'))] } });
  } else if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
  } else if (error?.code === '23505') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'Email or username is already in use.' } });
  } else if (error?.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Request body exceeds the limit.' } });
  } else if (error?.type === 'encoding.unsupported' || error?.type === 'charset.unsupported') {
    res.status(415).json({ error: { code: 'UNSUPPORTED_ENCODING', message: 'Send uncompressed UTF-8 JSON.' } });
  } else if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
  } else {
    // Log only a safe code and our generated request ID, never credentials or request bodies.
    console.error(JSON.stringify({ event: 'request_error', request_id: res.getHeader('X-Request-Id'), code: 'INTERNAL_ERROR' }));
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
  }
};
