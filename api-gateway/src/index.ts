
import express from "express";
import cors from "cors";
import { config } from "./config";

import healthRouter from "./routes/health";
import { energyRouter } from "./routes/energy";
import walletRouter from "./routes/wallet";
import { txRouter } from "./routes/tx";
import { complianceRouter } from "./routes/compliance";
import oracleRouter from "./routes/oracle";
import { configRouter } from "./routes/config";

const app = express();

app.use(cors());
app.use(express.json());

// Лог запросов
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Маршруты под префиксом /api
app.use("/api", healthRouter);
app.use("/api/energy", energyRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/tx", txRouter);
app.use("/api/compliance", complianceRouter);
app.use("/api/oracle", oracleRouter);
app.use("/api/config", configRouter);

app.listen(config.port, () => {
  console.log(`JERT API Gateway listening on port ${config.port}`);
  console.log(`RPC URL: ${config.rpcUrl}`);
});


