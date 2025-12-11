
import 'package:jert_network/config/jert_networks.dart';

class JertNetworkConfig {
  final JertNetworkKey networkKey;
  final JertNetworkInfo info;

  const JertNetworkConfig({
    required this.networkKey,
    required this.info,
  });

  String get rpcUrl => info.rpcUrl;
  int get chainId => info.chainId;

  String get tokenAddress => info.jertTokenAddress;
  String get treasuryAddress => info.treasuryAddress;

  String get explorer => info.explorerUrl;
}

final JertNetworkConfig defaultJertNetworkConfig = JertNetworkConfig(
  networkKey: defaultJertNetworkKey,
  info: defaultJertNetworkInfo,
);

String getDefaultTreasuryAddress() =>
    defaultJertNetworkConfig.treasuryAddress;

String getDefaultJertTokenAddress() =>
    defaultJertNetworkConfig.tokenAddress;
