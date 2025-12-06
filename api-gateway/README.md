JERT API Gateway — Documentation

The API Gateway provides the unified interface between the JERT Permissioned EVM Network,
the Energy Oracle, compliance systems, corporate wallets and mobile wallets.

It is the primary off-chain computation layer for:
- USD valuation
- Energy & cold-energy conversion
- Pricing logic
- Transaction routing
- Compliance (KYC/AML)
- Terminal integration services

---------------------------------------------------------------------

1. Architecture Overview

Mobile Wallet →  
Corporate Wallet →   API Gateway →  JERT EVM Network
                        │
                        ├── Energy Oracle (MWh / MWh-cold)
                        ├── Compliance Middleware (KYC/AML)
                        └── Terminal Integration Layer

No pricing logic is stored on-chain. All valuation and energy computation occur off-chain
to maintain regulatory safety (AIFC/AFSA).

---------------------------------------------------------------------

2. Energy Layer Endpoints (New)

GET /energy/rates  
Returns the active conversion rules and USD reference pricing.

Example Response:
{
  "networkId": 13371337,
  "jertPerMWh": 100,
  "jertPerMWhCold": 1000,
  "usdPerMWh": 1.0,
  "usdPerMWhCold": 10.0,
  "timestamp": "2025-01-01T00:00:00Z"
}

---------------------------------------------------------------------

GET /energy/convert?jert=X  
Returns how many MWh and MWh-cold correspond to a given JERT amount.

Example:
GET /energy/convert?jert=5000

Response:
{
  "jert": 5000,
  "energyMWhEquivalent": 50,
  "coldMWhEquivalent": 5,
  "networkId": 13371337
}

---------------------------------------------------------------------

3. Transaction Endpoints

GET /tx/history?address=0x...  
Returns transaction history from RPC + local buffer.

POST /tx/send  
Sends a signed transaction payload:
{ "rawTx": "0xf86d808..." }

---------------------------------------------------------------------

4. Compliance Endpoints

POST /compliance/kyc-check  
{ "address": "0x1234..." } → { "allowed": true }

POST /compliance/aml-check  
{ "address": "0x1234..." } → { "riskScore": 0.02, "allowed": true }

---------------------------------------------------------------------

5. Middle Corridor Oracle (Logistics)

GET /oracle/corridor-status  
Returns corridor telemetry for Kazakhstan → Caspian → Georgia → EU.

---------------------------------------------------------------------

6. Internal Structure

api-gateway/
  src/
    index.ts
    config.ts
    routes/
      energy.ts
      tx.ts
      compliance.ts
      oracle.ts
    compliance-middleware/
      kyc-check.ts
      aml-check.ts
    middle-corridor-oracle/
      oracle-handler.ts

---------------------------------------------------------------------

7. Environment Variables (.env)

RPC_URL=http://localhost:8545  
NETWORK_ID=13371337  
ENERGY_USD_MWH=1  
ENERGY_USD_MWH_COLD=10  
JERT_PER_MWH=100  
JERT_PER_MWH_COLD=1000  

---------------------------------------------------------------------

8. Production Notes

- No pricing logic on-chain  
- All USD/energy computation off-chain  
- Adjustable pricing without redeploying contracts  
- Regulatory-safe structure (utility token only)  

---------------------------------------------------------------------

9. Future Extensions

- Carbon offset integration  
- LNG throughput index  
- Cold-energy extraction telemetry  
- Terminal-to-terminal dynamic pricing  

---------------------------------------------------------------------

Contact: info@cryogas.kz



