import type { FastifyError, FastifyInstance } from "fastify";

export class AppError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string>;

  constructor(statusCode: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      });
    }

    if ("validation" in error && error.validation) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Request validation failed." },
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
      });
    }

    // Fastify-native errors (malformed body, bad content-type, etc.) already
    // carry an accurate 4xx statusCode — don't flatten those into a 500.
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        success: false,
        error: { code: error.code ?? "BAD_REQUEST", message: error.message || "Invalid request." },
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong." },
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource not found." },
    });
  });
}
