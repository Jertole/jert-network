
import express from "express";
import cors from "cors";
import { config } from "./config";

import healthRouter from "./routes/health";
import txRouter from "./routes/tx";
import oracleRouter from "./routes/oracle";
import complianceRouter from "./routes/compliance";

const app = express();

// базовые middleware
app.use(cors());
app.use(express.json());

// маршруты
app.use("/api", healthRouter);
app.use("/api", txRouter);
app.use("/api", oracleRouter);
app.use("/api", complianceRouter);

app.get("/", (_req, res) => {
  res.send("JERT API Gateway is running");
});

app.listen(config.port, () => {
  console.log(`JERT API Gateway listening on port ${config.port}`);
});
