
import { Request, Response, NextFunction } from "express";

/**
 * Middleware-заглушка для AML (санкции, источники средств и т.д.).
 */
export function amlCheck(req: Request, res: Response, next: NextFunction) {
  // TODO: реальная AML логика
  return next();
}
