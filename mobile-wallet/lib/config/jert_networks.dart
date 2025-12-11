
/// Ключи поддерживаемых сетей JERT.
enum JertNetworkKey {
  hardhat,
  sepolia,
}

/// Информация о сети JERT.
class JertNetworkInfo {
  final String name;
  final int chainId;
  final String rpcUrl;
  final String explorerUrl;

  /// ВАЖНО: эти два поля нужны для jert_network_config.dart
  final String jertTokenAddress;
  final String treasuryAddress;

  const JertNetworkInfo({
    required this.name,
    required this.chainId,
    required this.rpcUrl,
    required this.explorerUrl,
    required this.jertTokenAddress,
    required this.treasuryAddress,
  });
}

/// Карта всех сетей JERT, которые понимает приложение.
const Map<JertNetworkKey, JertNetworkInfo> jertNetworks = {
  JertNetworkKey.hardhat: JertNetworkInfo(
    name: 'Hardhat Local',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: '',
    jertTokenAddress: '0x0000000000000000000000000000000000000000',
    treasuryAddress: '0x0000000000000000000000000000000000000000',
  ),
 JertNetworkKey.sepolia: JertNetworkInfo(
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/c804f9d1cf174022b994886424a2d3ac',
    explorerUrl: 'https://sepolia.etherscan.io',
    jertTokenAddress: '0xaa8626c43ccf59317f71a5755fc7d65607daab0fa54d26d833df9ff9f6903cdd',
    treasuryAddress: '0xАДРЕС_КАЗНАЧЕЙСТВА',
  ),
};

/// Сеть по умолчанию.
const JertNetworkKey defaultJertNetworkKey = JertNetworkKey.sepolia;

/// Инфо по сети по умолчанию.
JertNetworkInfo get defaultJertNetworkInfo =>
    jertNetworks[defaultJertNetworkKey]!;
