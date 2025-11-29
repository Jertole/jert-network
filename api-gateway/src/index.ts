app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
import { kycCheck } from "../compliance-middleware/kyc-check";
import { amlCheck } from "../compliance-middleware/aml-check";

app.use("/api/tx/send", kycCheck, amlCheck);   // only KYC/AML users may send TX
app.use("/api/oracle/update", amlCheck);       // oracle must be verified source
