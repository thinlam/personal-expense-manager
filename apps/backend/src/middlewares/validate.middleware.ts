import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return next({ status: 400, message: "Validation error", details: issues });
    }
    req.body = parsed.data;
    next();
  };
}
