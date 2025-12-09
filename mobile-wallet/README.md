## 5️⃣ Мини README для Flutter Wallet

**Файл:** `flutter-wallet/README.md`

```markdown
# JERT Mobile Wallet (Flutter)

Non-custodial mobile wallet for **JERT Permissioned EVM**.

## Features

- Create / import private key (EVM)
- PIN-protected app unlock
- 2FA: PIN confirmation for each JERT transfer
- View JERT + ETH balances
- Receive screen with QR code
- Basic transaction list from API Gateway

## Config

RPC + API config lives in `lib/config.dart`:

```dart
const String jertRpcUrl = 'http://127.0.0.1:8545';
const String jertTokenAddress = '0x...';
const int jertChainId = 1337;
const String jertApiBaseUrl = 'http://127.0.0.1:4000/api';

