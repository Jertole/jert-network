# jert-network

JERT Network Monorepo — инфраструктура для JERT Permissioned EVM Network,
поддерживаемой Cryogas Kazakhstan, Vitlax Nordic AB (Sweden) и SY Power Energy (Switzerland)
в рамках стратегии **“Building the Green Cold Energy Network across Eurasia”**.

## USD & Energy-Denominated Utility

JERT — это **USD-номинированный утилити-токен**, связанный с реальными
энергетическими потоками внутри инфраструктуры Cryogas:

- **100 JERT = 1 MWh** электрической/тепловой энергии  
- **1000 JERT = 1 MWh-Cold** (криогенная холодовая энергия, извлекаемая при регазификации LNG)

Модель двойной деноминации:

- USD-слой — финансовая понятность для инвесторов и партнёров  
- Energy-слой — реальная индустриальная полезность для терминалов, складов, LCNG, дата-центров  

Все расчёты тарифов и цен выполняются **off-chain** через JERT API (energy oracle),
см. раздел `docs/EnergyLayer.md`.

Repository structure:
evm-chain/ – permissioned EVM
smart-contracts/ – Solidity code
api-gateway/ – backend API layer
corporate-wallet/ – React multisig wallet
mobile-wallet/ – Flutter wallet
docs/ – whitepaper, architecture, specifications.


