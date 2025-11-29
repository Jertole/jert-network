
import { Router, Request, Response } from "express";

const router = Router();

/**
 * Oracle endpoint stub – будет использоваться для подачи данных
 * Middle Corridor / LNG / ESG в сеть JERT.
 */
router.post("/oracle/update", async (req: Request, res: Response) => {
  const payload = req.body;

  // TODO: валидация, подпись, отправка в смарт-контракт
  console.log("Received oracle payload:", payload);

  return res.json({
    status: "queued",
    note: "Oracle integration not implemented yet"
  });
});

export default router;
