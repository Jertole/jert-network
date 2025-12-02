# JERT API Gateway — USD Edition
The API Gateway unifies all backend logic for the JERT ecosystem:
- USD-denominated pricing
- TX routing (signed/broadcast)
- Compliance middleware (KYC/AML)
- Middle Corridor oracle
- Wallet services

Endpoints:
GET /health
POST /tx/send
GET /tx/history
GET /wallet/balance
GET /oracle/route
POST /compliance/kyc-check


