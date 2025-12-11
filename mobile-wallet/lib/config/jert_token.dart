
import 'jert_networks.dart';

/// Адреса JERT токена и казначейства по сети
class JertTokenConfig {
  final String tokenAddress;
  final String treasuryAddress;

  const JertTokenConfig({
    required this.tokenAddress,
    required this.treasuryAddress,
  });
}

/// Карта адресов по сети
const Map<JertNetworkKey, JertTokenConfig> jertTokenConfigs = {
  JertNetworkKey.hardhat: JertTokenConfig(
    tokenAddress: '0x0000000000000000000000000000000000000001',
    treasuryAddress: '0x0000000000000000000000000000000000000002',
  ),
  JertNetworkKey.sepolia: JertTokenConfig(
    tokenAddress: '0x0000000000000000000000000000000000000003',
    treasuryAddress: '0x0000000000000000000000000000000000000004',
  ),
};

/// Конфиг токена по сети по умолчанию
JertTokenConfig getDefaultJertTokenConfig() {
  return jertTokenConfigs[defaultJertNetworkKey]!;
}

/// Адрес токена по умолчанию
String getDefaultJertTokenAddress() =>
    getDefaultJertTokenConfig().tokenAddress;

/// Адрес казначейства по умолчанию
String getDefaultTreasuryAddress() =>
    getDefaultJertTokenConfig().treasuryAddress;
