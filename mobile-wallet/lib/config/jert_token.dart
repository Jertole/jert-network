
// lib/config/jert_token.dart

import 'jert_networks.dart';

class JertTokenAddress {
  final JertNetworkKey network;
  final String address;

  const JertTokenAddress({
    required this.network,
    required this.address,
  });
}

// заглушки — потом подставишь реальные адреса
const Map<JertNetworkKey, String> jertTokenAddresses = {
  JertNetworkKey.hardhat: '0x0000000000000000000000000000000000000000',
  JertNetworkKey.sepolia: '0x0000000000000000000000000000000000000000',
};

String? getJertTokenAddress(JertNetworkKey key) {
  final addr = jertTokenAddresses[key];
  if (addr == null || addr == '0x0000000000000000000000000000000000000000') {
    return null;
  }
  return addr;
}
