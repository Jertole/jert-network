# JERT Marketplace Architecture

Public description of the target architecture · Version 0.2 · November 11, 2026

[www.jert.net](https://www.jert.net/)

JERT Marketplace is designed for trading goods and services in logistics, cold-chain infrastructure, energy, and computing. Participants verify their identity through Didit, gain access to the operations available to them, and pay for orders through a connected wallet. JERT is the common unit of account for Marketplace. JDAT Core links goods movement, warehouse capacity leasing, and settlement within the same transaction. CIR determines when the verified state of the transaction allows the next operation to proceed.

## Participants, JIPP, and Didit

Participants start by registering with JIPP. Didit verifies their identity and handles repeat verification where required. For corporate participants, the process includes KYB and verification of the representative's authority. JERT uses the verification result to determine access to Marketplace functions. JERT determines whether a participant may act on behalf of a company or perform a specific operation based on their role, authority, and the status of the transaction.

JIPP administers the loyalty program. Customers keep their funds and private keys in their own wallets. When a wallet address is linked to an account, proof of control over the address is verified separately from KYC. Marketplace may require repeat verification through Didit for actions defined in its configuration. [Didit documentation](https://help.didit.me/workflows/build-a-verification-workflow)

## Pricing in JERT and Payment through JERT Wallet

API Gateway, Corporate Wallet, and Marketplace use the same pricing rule, `jert-reference-v1`. **The fixed reference value per JERT is 0.10 USD, 0.10 USDT, or 0.10 USDC**, depending on the unit of the source amount. The values are used to calculate equivalents. Market quotes, DEX execution prices, and asset valuations use their own sources. [Versioned JERT Network pricing rule](../api-gateway/src/jert-reference-pricing.ts)

| Component | Application |
| --- | --- |
| API Gateway | Multiplies the JERT balance by 0.10 to calculate its USD equivalent. The response includes the applied rule, the calculation time, and the `chainId` of the balance network. USD equivalents for energy conversion ratios use the same rule. |
| Corporate Wallet | Uses the same rule to display the JERT reference value and the USD equivalent. |
| Marketplace | Divides the final offer price in USD, USDT, or USDC by 0.10. For example, an offer of 25.50 USD requires 255 JERT. The order is payable in JERT. |

### Fixing the Order Amount

At checkout, the Marketplace server uses the final price from the agreed offer. For another currency, it first converts the price to USD under the foreign exchange rule approved for the order and records the source, rate, and observation time. The server calculates the JERT amount using decimal arithmetic, rounds once to token precision under the published rounding rule, and stores the result in the token's smallest units. Marketplace displays the network fee separately. The applicable contract and accounting requirements determine the currency of source documents and the terms of supplier settlement.

At checkout, the server saves the quote in the existing JDAT Core order record. The order records the following information so the calculation can be reproduced.

| Data | Recorded information |
| --- | --- |
| Source and rule | Offer ID and version, original total and pricing unit, JERT rule ID and version, applied value of `0.10`, precision, and rounding rule. For foreign exchange conversion, the inputs and result are also retained. |
| Network and asset | Payment route `chainId`, JERT contract address, token precision, and recipient address. The public JERT token registry identifies Arbitrum One (`42161`) and the token contract. The quote records the approved route for the specific order. [Public JERT token registry](../assets/README.md) |
| Time and validity | UTC time when the quote was issued and `expiresAt` from the active offer. For the fixed rule, the issue time shows when the rule was applied. For an external exchange rate, the source observation time is also retained. |
| Quote confirmation | Order ID and quote ID, the saved JERT amount in the token's smallest units, and the server record that the quote was accepted for the order. |
| Payment confirmation | A reference to the confirmed transfer event, including the network, transaction hash, event log index, and actual amount. |

JERT Wallet passes the saved quote parameters to the customer's own wallet for review and signature. A repeat request returns the same quote. A changed offer or an expired quote requires a new quote and separate customer confirmation. The original record is retained for reconciliation.

The existing payment flow matches the confirmed transfer against the saved quote by network, token contract, recipient, amount, and validity period. The transfer's block inclusion time determines whether it met the deadline. Confirmation may arrive after expiry if the transfer was included in a block before `expiresAt`. Each transfer event is credited once. JDAT Core records the result against the order, and JDAT CIR checks readiness for the next step. JIPP administers loyalty. USDT and USDC serve as reference units under this rule.

## Goods Movement, Warehouse Leasing, and Settlement

In the target architecture, JDAT Core links the order, stages of goods movement, use of warehouse capacity, and settlement obligations. The carrier and warehouse confirm actual events through the Marketplace workflow. Confirmations of receipt, movement, and release are linked to the relevant shipment and order. Marketplace reconciles storage, leasing, and logistics charges and payment confirmations against the same transaction.

An Ethereum-compatible Leasing Contract on Polygon is planned for leasing warehouses and warehouse capacity. JDAT Core links the lease record and its status to the relevant agreement, warehouse, and order. For example, before a shipment is received, CIR can verify that warehouse capacity has been allocated for the required period and that the receipt conditions have been met. The warehouse confirms receipt, which updates the transaction state.

## Execution Control through JDAT CIR

JDAT Core stores order state and verified operation results. JDAT CIR assesses readiness for the next action. The decision to proceed depends on the order state, the participant's authority, and the evidence required for that step.

| Stage | Evidence required to proceed |
| --- | --- |
| Registration | The participant's identity is established. For a company, the required details and the representative's authority are verified. |
| Order | The offer, parties, price, and fulfillment terms are agreed. |
| Payment | A transfer matching the specific order is confirmed. |
| Warehouse leasing and receipt | Capacity allocation, lease term, and actual shipment receipt are confirmed where required by the order. |
| Movement and release | The required stages of goods movement are confirmed and the conditions for release, delivery, or service provision are met. |
| Closure | The required evidence of fulfillment is received and the transaction outcome is recorded. |

Payment confirmation updates the payment state. Before goods are released or a service begins, CIR also verifies the fulfillment conditions. The next step becomes available when the required evidence is present. New evidence updates the order state and triggers a fresh assessment of whether the next action may proceed.

## Status

This document describes the target architecture. Availability of individual features and payment routes depends on verification of the specific scenario.
