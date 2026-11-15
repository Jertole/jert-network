# JERT Marketplace Architecture

Public target architecture · Version 0.3 · November 15, 2026

Originally published November 11, 2026 (v0.2).

[www.jert.net](https://www.jert.net/)

JERT Marketplace is designed for trading goods and services across logistics, cold storage, energy, and computing. Participants verify their identity through Didit, gain access to authorized operations, and pay for orders from a connected wallet. JERT is the common unit of account on the Marketplace. JDAT Core links the movement of goods, storage leases, and settlement within each transaction. CIR determines when the confirmed state of a transaction allows the next operation to proceed.

## Participants, JIPP, and Didit

Participants begin by registering with JIPP. Didit supports identity verification and repeat checks where required. For businesses, the process includes KYB and verification of the representative's authority. JERT uses the results to determine access to Marketplace functions. Authorization to act on behalf of a business or perform a specific operation depends on the participant's role, authority, and transaction status.

JIPP operates the loyalty program. Customer funds and private keys remain in the customer's wallet. When a wallet address is linked to an account, control of the address is verified separately from KYC. Marketplace may require another Didit check for selected actions, as defined in the service configuration. [Didit documentation](https://help.didit.me/workflows/build-a-verification-workflow)

## Pricing in JERT and Payment through JERT Wallet

API Gateway, Corporate Wallet, and Marketplace use [`jert-reference-v1`](../api-gateway/src/jert-reference-pricing.ts). The fixed reference value is 0.10 USD, 0.10 USDT, or 0.10 USDC per JERT. Marketplace divides the final offer amount in its reference unit by 0.10. For other currencies, it uses the approved FX rule and records the source, rate, and observation time. Market prices and asset valuations use their own sources.

At checkout, Marketplace displays the original price, the JERT amount, the offer expiry, and any network fee separately. The server calculates the JERT amount using decimal arithmetic and rounds once to token precision under the applicable rounding rule. The existing JDAT Core order record holds the authoritative quote, including the offer ID and version, the original amount and unit, the rule ID and applied value, the rounding rule, the JERT amount in smallest units, the approved network, token contract and recipient, and the issue and expiry times. Repeated requests reuse the same valid quote. A changed offer or an expired quote requires a new quote and customer confirmation. The applicable agreement and accounting requirements determine source-document currency and supplier settlement.

The customer reviews and signs the saved payment parameters in their connected wallet. Marketplace matches the confirmed transfer to the saved quote by network, token contract, recipient, amount, and validity period. JDAT Core records the result against the order. JDAT CIR evaluates readiness from that State and the required evidence. Guard enforces the existing authorization controls within its mandate. JIPP does not maintain customer JERT balances. Stablecoins may be used for settlement or conversion where the agreement or route provides for them. The customer pays the Marketplace order in JERT.

## Contractual Rights Registry and International Warehouse Receipts

JERT Marketplace records verifiable rights to **goods, infrastructure capacity, and services**. A right is based on a real agreement, applicable law and the authorized parties; the Marketplace record does not create a legal right merely by assigning an identifier. JDAT Core maintains the authenticated rights state, and JDAT CIR/Guard evaluates readiness and authorization for each operation.

### Universal RIGHT and RIGHT ID

Every registered contractual right has a unique, persistent **RIGHT ID**, separate from the underlying agreement ID, order ID, payment reference, wallet address, asset ID or (where applicable) warehouse receipt ID. The canonical record references:
- RIGHT ID and right type; issuing/granting legal entity; entitled holder and verified representative; underlying signed agreement, version and governing law;
- exact subject (goods, physical infrastructure capacity, or a defined service), quantity or capacity, quality/service parameters, location, effective and expiry dates, performance and release conditions;
- agreed price or pricing formula, prepayment and crediting rules, payment evidence, liabilities and remedies;
- transfer/assignment/sublease permissions, required consents, existing pledges/encumbrances, current entitlement and remaining unfulfilled balance;
- authoritative status, approvals, related RIGHT IDs, and immutable references to execution and Evidence records.

A draft offer is not an enforceable RIGHT. A RIGHT becomes operative only after the underlying agreement and required authority are verified. Assignment, partial transfer, subdivision, pledge, exercise and expiration are separate state transitions, each gated by the applicable contract, law, verified balance, consents and Guard. A transferred or exercised quantity cannot be allocated twice. The rights registry does not independently establish title, lender acceptance, negotiability or statutory security perfection.

### Forward Rights — Goods and Infrastructure Services

The forward-right model applies to **both future goods and prepaid or reserved infrastructure services**, including:

| Right type | Entitlement | Core evidence and limits |
| --- | --- | --- |
| **Forward LNG Offtake Right** | Contractual right to specified future LNG quantities under an executed LNG sale and purchase/offtake agreement | RIGHT ID; SPA; product specification; delivery schedule, destination and terms; actual prepaid amount, if any; assignments; remaining contracted tonnes. Future LNG is not booked as existing inventory. |
| **Cold Storage Capacity / Lease Right** | Contractual right to use reserved refrigerated or frozen-storage capacity over a defined period | RIGHT ID; named facility/zone; reserved mass, volume or pallet positions; temperature/service conditions; commencement, expiry, availability, permitted sublease or transfer and capacity allocation. This is not proof of ownership of goods in storage. |
| **Compute Service Entitlement / SLA Right** | Contractual right to receive specified compute, connectivity or related digital infrastructure services subject to agreed SLA | RIGHT ID; defined service, allocated capacity or usage units, location/region where relevant, service period, uptime/performance and support commitments, measurement methods, SLA credits/remedies, transfer limits and authorized consumption records. An SLA is a contractual commitment, not a warehouse receipt. |
| **Other Goods or Infrastructure Rights** | Additional qualified rights to goods or services listed on JERT Marketplace | An identified legal basis, measurable deliverable and use or transfer conditions, with JDAT State and independent Evidence. |

An offtake prepayment or prepaid storage/compute service may contribute to project financing only to the extent that funds are actually received, available for the relevant purpose, and the counterparty and bank accept the contract and credit structure. **Prepayments are obligations to deliver goods or services (or provide agreed remedies), not automatically shareholder equity or bank-eligible collateral.** They are not valued from the JERT token reference price without verified settlement.

A holder may offer an authorized assignment of a RIGHT on JERT Marketplace only where the contract and applicable law permit it. JDAT records the successor, remaining deliverable and applicable price/settlement evidence without creating duplicate claims. Sale of a RIGHT is separate from physically delivering goods or consuming the service.

### Electronic Warehouse Receipt (EWR) — Any Eligible Stored Goods

An **Electronic Warehouse Receipt (EWR)** is issued by an authorized warehouse operator only after **existing physical goods** have been accepted into verified custody. It acknowledges the goods and the operator's delivery obligation to the legally entitled holder. This is a Marketplace-wide document form for **any eligible goods stored at JERT or approved participating warehouses** (e.g. food, refrigerated products, LNG and other merchandise), not a product restricted to LNG.

Each EWR has its own receipt identifier and a link to the relevant RIGHT ID(s), contract(s) and physical inventory record where applicable. Its required data include issuer/operator identity and signature, depositor and holder, identified warehouse, receipt date, goods description and condition, verified mass/units, lot/serial/container identifiers, applicable storage conditions, warehouse charges, registered liens/pledges, transferability form and governing law. For LNG at Aktobe South, the inventory is identified by **each individual 40-foot ISO LNG container number and fill-batch ID**, with an independently confirmed mass per container; no fictional pooled tank balance is created.

International interoperability of the EWR is a design requirement aligned with:
- [UNCITRAL–UNIDROIT Model Law on Warehouse Receipts (2024)](https://uncitral.un.org/en/mlwr), covering electronic or paper receipts, custody, transfer and security interests;
- [UNCITRAL Model Law on Electronic Transferable Records (MLETR, 2017)](https://uncitral.un.org/en/texts/ecommerce/modellaw/electronic_transferable_records), including integrity, identification, reliable exclusive control and transfer of control where a transferable electronic document is legally supported.

Internationally oriented format **does not establish automatic cross-border legal recognition or negotiability**. A jurisdiction must recognize the applicable instrument and the issuing operator must be authorized; lender acceptance and any local register, collateral and transport rules must also be satisfied. Where these requirements are not met, the system records an electronic custody confirmation and does not misrepresent it as a legally transferable or pledgeable warehouse receipt.

The operator attests receipt, transfer acknowledgment, permitted partial release and dispatch. JDAT Core prevents two simultaneously effective negotiable receipts or a receipt transfer that conflicts with a registered pledge for the same goods. Guard blocks disposal where quantity, exclusive control, legal authority, custody, safety or encumbrance evidence is missing. On partial release or dispatch, inventory and the receipt are reduced, replaced or cancelled as legally required, with independent physical Evidence. Storage at the origin cannot continue to be claimed after a confirmed release to the carrier.

A **Cold Storage Capacity Right** grants use of refrigerated space; an **EWR** confirms goods actually placed in that space. A **Compute SLA Right** grants digital service; it never becomes an EWR. A **Forward LNG Offtake Right** may later be linked to physical LNG and an EWR after production and verified storage; the resulting physical allocation reduces the forward entitlement rather than creating a second independent claim.

### Rights-Backed Financing Boundaries

JERT Marketplace may document prepaid sale/offtake agreements, prepaid infrastructure leases, or prepaid compute-service contracts, and their permitted assignment as part of a project financing package. An EWR may separately support goods-backed financing where legally effective. JDAT Core links agreements, RIGHT IDs, payment evidence, allocations, receipts, encumbrances and performance to prohibit double financing of the same entitlement. Banks independently determine credit eligibility, valuation, security and funding conditions. The JERT Utility Token is not itself the warehouse receipt, a security interest or an automatically enforceable RIGHT.

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
| Contractual RIGHT registration | The underlying agreement and legal authority are authenticated, the unique RIGHT ID is linked to its deliverable, existing allocations and any restrictions, and the right is classified as operative or conditional. |
| Forward right transfer or exercise | Contractual consent, holder authority, remaining capacity or goods quantity, encumbrances, and payment and performance Evidence are verified before reassignment or fulfilment. |
| Electronic warehouse receipt | Physical goods have been received, measured and verified by the authorized custodian; receipt issuance and any transfer or pledge meet the applicable legal and control conditions. |
| Payment | A transfer matching the specific order is confirmed. |
| Storage lease and receipt | The Cold Storage Capacity RIGHT ID, facility capacity and lease term are verified; physical goods receipt and any EWR are confirmed separately where required by the order. |
| Resale in place | The seller's entitlement, available quantity, transfer and settlement terms, and the custodian's acknowledgment of the new holder are confirmed. For LNG, container numbers and fill batches are verified. |
| Movement and release | Required movements and service-performance records are confirmed; RIGHT ID balances and, where applicable, EWR control, custody and cancellation are reconciled before release, delivery or service provision. |
| Closure | The required fulfillment evidence is received and the transaction outcome is recorded. |

Payment confirmation updates the payment status. Before goods are released or a service begins, CIR also checks the applicable fulfillment conditions. The next stage remains unavailable while required evidence is missing. Once the evidence is received, the order state is updated and eligibility for the next action is reassessed.

## Status

This document describes the target architecture. The availability of individual features and settlement routes depends on verification of each scenario. The universal RIGHT ID, forward goods and service rights, and interoperable EWR are proposed architecture; legal recognition, deployment and individual financing transactions require separate validation.
