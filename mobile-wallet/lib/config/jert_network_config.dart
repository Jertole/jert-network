
import 'package:jert_network/config/jert_networks.dart';
import 'package:jert_network/config/jert_token.dart';

/// Конфиг сети JERT для UI (баланс, адреса и т.п.)
class JertNetworkConfig {
  final JertNetworkKey networkKey;
  final String networkName;
  final String rpcUrl;
  final int chainId;
  final String explorerUrl;
  final String jertTokenAddress;
  final String treasuryAddress;

  const JertNetworkConfig({
    required this.networkKey,
    required this.networkName,
    required this.rpcUrl,
    required this.chainId,
    required this.explorerUrl,
    required this.jertTokenAddress,
    required this.treasuryAddress,
  });
}

/// Получить конфиг по умолчанию для мобильного приложения
JertNetworkConfig getDefaultJertNetworkConfig() {
  final info = defaultJertNetworkInfo;

  return JertNetworkConfig(
    networkKey: defaultJertNetworkKey,
    networkName: info.name,
    rpcUrl: info.rpcUrl,
    chainId: info.chainId,
    explorerUrl: info.explorerUrl,
    jertTokenAddress: getDefaultJertTokenAddress(),
    treasuryAddress: getDefaultTreasuryAddress(),
  );
}
