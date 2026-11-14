# JERT Marketplace Architecture

Public target architecture · Version 0.2 · November 11, 2026

[www.jert.net](https://www.jert.net/)

JERT Marketplace is designed for trading goods and services across logistics, cold storage, energy, and computing. Participants verify their identity through Didit, gain access to authorized operations, and pay for orders from a connected wallet. JERT is the common unit of account on the Marketplace. JDAT Core links the movement of goods, storage leases, and settlement within each transaction. CIR determines when the confirmed state of a transaction allows the next operation to proceed.

## Participants, JIPP, and Didit

Participants begin by registering with JIPP. Didit supports identity verification and repeat checks where required. For businesses, the process includes KYB and verification of the representative's authority. JERT uses the results to determine access to Marketplace functions. Authorization to act on behalf of a business or perform a specific operation depends on the participant's role, authority, and transaction status.

JIPP operates the loyalty program. Customer funds and private keys remain in the customer's wallet. When a wallet address is linked to an account, control of the address is verified separately from KYC. Marketplace may require another Didit check for selected actions, as defined in the service configuration. [Didit documentation](https://help.didit.me/workflows/build-a-verification-workflow)

## Pricing in JERT and Payment through JERT Wallet

At checkout, Marketplace displays the amount payable in JERT. When a good or service is quoted in fiat currency, Marketplace converts the price into JERT using its published pricing rule and locks the amount for the duration of the offer. The customer sees the original price, the amount in JERT, the expiry time, and any applicable network fee. Marketplace rules define the exchange rate source and how long the amount is locked. The applicable agreement and accounting requirements determine the currency of source documents and the terms of settlement with the supplier.

JERT Wallet connects to the customer's own wallet. The customer reviews and signs the transfer in that wallet. Marketplace matches the confirmed transfer to the order by network, asset, recipient, and amount. JIPP does not maintain customer balances in JERT. Stablecoins may be used for settlement or conversion where the relevant agreement or settlement route provides for them. The amount payable by the customer on Marketplace is expressed in JERT.

## Goods Movement, Storage Leases, and Settlement

In the target architecture, JDAT Core links orders, goods movements, use of storage capacity, and settlement obligations. Carriers and storage operators confirm physical events through Marketplace. Receipt, movement, and release confirmations reference the corresponding lot and order. Marketplace reconciles storage, lease, and logistics charges and payment confirmations against the same transaction.

The architecture provides for an Ethereum-compatible Leasing Contract on Polygon for warehouse and storage capacity leases. JDAT Core links the lease record and its status to the relevant agreement, facility, and order. Before a lot is received, CIR can verify that storage capacity has been allocated for the required period and that receipt conditions have been met. The storage operator confirms receipt, which updates the transaction state.

### Partial Release and Resale in Place

At JERT Cold Hills, a buyer can collect part of a lot held in storage and resell the remainder to another Marketplace participant. JDAT Core links the physical lot, its mass, storage location, and responsible custodian to the quantity each participant is entitled to dispose of. On resale, Core deducts the agreed quantity from the seller's entitlement and credits it to the buyer. The physical inventory, location, and custodian stay the same. On release, Core reduces the holder's entitlement and the physical inventory by the quantity the custodian confirms was released. Food traceability records link the original lot, labels, applicable documents, storage conditions, and actual recipients.

### Small-Scale LNG at Aktobe South

Standard 40-foot ISO LNG tank containers are filled at the production site and stored in the open yard at Aktobe South. JDAT Core tracks the remaining LNG separately by container number and fill batch ID. On receipt, the custodian confirms both identifiers, net mass, and the container's position in the yard. Production, transport, receipt, and release records use the same identifiers.

Each sale or resale covers **20 to 1,000 metric tonnes, inclusive**. A transaction can cover several containers and specifies the agreed mass for each container number. A resale in place transfers the entitlement to the specified quantity of LNG. The containers stay in their yard positions, and physical inventory continues to be tracked by container number. On dispatch, the custodian confirms the container number, the mass handed over, and the recipient. Where the agreement and operating conditions permit a partial release, CIR authorizes it for the specific container and Core updates the balance using the confirmed measurement. A mass discrepancy blocks operations that depend on the affected balance until reconciliation.

### Storage Utilization and Commercial Metrics

Tonne-days are calculated from actual mass and time in storage. At Aktobe South, they are calculated for each ISO LNG container number. Resale in place continues the utilization calculation against the same physical inventory. Responsibility for storage charges may change on the date specified by the agreement. Gross merchandise value (GMV) counts each completed sale and resale once. When JERT acts as an agent for a sale, JERT revenue includes earned commissions and fees for services provided under the agreement, including storage, handling, and logistics.

## Execution Control through JDAT CIR

JDAT Core records order state and confirmed operation results. JDAT CIR assesses readiness for the next action based on the order state, the participant's authority, and the evidence required at that stage.

| Stage | Evidence required to proceed |
| --- | --- |
| Registration | The participant's identity is verified. For a business, the required company information and the representative's authority are verified. |
| Order | The offer, parties, price, and fulfillment terms are agreed. |
| Payment | A transfer matching the specific order is confirmed. |
| Storage lease and receipt | Capacity allocation, the lease term, and physical receipt of the lot are confirmed where required by the order. |
| Resale in place | The seller's entitlement, available quantity, transfer and settlement terms, and the custodian's acknowledgment of the new holder are confirmed. For LNG, container numbers and fill batches are verified. |
| Movement and release | Required movements are confirmed and the conditions for release, delivery, or service provision are met. |
| Closure | The required fulfillment evidence is received and the transaction outcome is recorded. |

Payment confirmation updates the payment status. Before goods are released or a service begins, CIR also checks the applicable fulfillment conditions. The next stage remains unavailable while required evidence is missing. Once the evidence is received, the order state is updated and eligibility for the next action is reassessed.

## Status

This document describes the target architecture. The availability of individual features and settlement routes depends on verification of each scenario.
