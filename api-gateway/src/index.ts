app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
import { kycCheck } from "../compliance-middleware/kyc-check";
import { amlCheck } from "../compliance-middleware/aml-check";
import walletRouter from "./router/wallet":
import express from "express";
import { energyRouter } from "./routes/energy";
import { txRouter } from "./routes/tx";
app.use("/tx", txRouter);

const app = express();
app.use(express.json());

app.use("/energy", energyRouter);
app.use("/api",walletRouter);
app.use("/api",healthRouter);
app.use("/api",txRouter);
app.use("/api",oracleRouter);
app.use("/api",complianceRouter);
app.use("/api/tx/send", kycCheck, amlCheck);   // only KYC/AML users may send TX
app.use("/api/oracle/update", amlCheck);       // oracle must be verified source
