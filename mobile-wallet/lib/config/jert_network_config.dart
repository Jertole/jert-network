
// lib/config/jert_network_config.dart

import 'package:jert_network/config/jert_networks.dart';

/// Конфигурация текущей сети JERT.
/// Этот класс позволяет UI переключаться между Hardhat/Sepolia и
/// получать правильные адреса токена, трежери и RPC.

class JertNetworkConfig {
  final JertNetworkKey networkKey;
  final JertNetworkInfo info;

  const JertNetworkConfig({
    required this.networkKey,
    required this.info,
  });

  /// RPC URL для Web3 клиента
  String get rpcUrl => info.rpcUrl;

  /// Chain ID сети
  int get chainId => info.chainId;

  /// Адрес токена JERT в этой сети
  String get tokenAddress => info.jertTokenAddress;

  /// Адрес казначейства в этой сети
  String get treasuryAddress => info.treasuryAddress;

  /// URL эксплорера (если есть)
  String get explorer => info.explorerUrl;
}

/// Глобальная конфигурация по умолчанию — используется приложением,
/// пока пользователь не выберет другую сеть.
final JertNetworkConfig defaultJertNetworkConfig = JertNetworkConfig(
  networkKey: defaultJertNetworkKey,
  info: defaultJertNetworkInfo,
);

/// Функция для получения текущего трежери в UI
String getDefaultTreasuryAddress() =>
    defaultJertNetworkConfig.treasuryAddress;

/// Функция для получения адреса токена JERT
String getDefaultJertTokenAddress() =>
    defaultJertNetworkConfig.tokenAddress;
