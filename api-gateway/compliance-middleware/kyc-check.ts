import { Request, Response, NextFunction } from "express";

/**
 * Middleware-заглушка. Далее здесь будет проверка адреса/пользователя по внешнему KYC-сервису.
 */
export function kycCheck(req: Request, res: Response, next: NextFunction) {
  // TODO: реальная проверка
  // пока просто пропускаем:
  return next();
}
