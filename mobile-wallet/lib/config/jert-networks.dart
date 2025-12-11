
/// Ключи поддерживаемых сетей JERT
enum JertNetworkKey {
  hardhat,
  sepolia,
}

/// Базовая информация о сети
class JertNetworkInfo {
  final String name;
  final String rpcUrl;
  final int chainId;
  final String explorerUrl;

  const JertNetworkInfo({
    required this.name,
    required this.rpcUrl,
    required this.chainId,
    required this.explorerUrl,
  });
}

/// Сеть по умолчанию (сейчас — Sepolia)
const JertNetworkKey defaultJertNetworkKey = JertNetworkKey.sepolia;

/// Карта сетей по ключу
const Map<JertNetworkKey, JertNetworkInfo> jertNetworks = {
  JertNetworkKey.hardhat: JertNetworkInfo(
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    explorerUrl: '',
  ),
  JertNetworkKey.sepolia: JertNetworkInfo(
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io',
  ),
};

/// Удобный доступ к сети по умолчанию
JertNetworkInfo get defaultJertNetworkInfo =>
    jertNetworks[defaultJertNetworkKey]!;

/// Шорткаты, чтобы старый код типа jertRpcUrl/jertChainId не ломался
String get jertRpcUrl => defaultJertNetworkInfo.rpcUrl;
int get jertChainId => defaultJertNetworkInfo.chainId;
String get jertExplorerUrl => defaultJertNetworkInfo.explorerUrl;

/// Базовый URL backend (потом заменим на реальный)
String get jertApiBaseUrl => 'https://api.jert.network';
