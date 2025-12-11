// lib/config/jert_networks.dart

enum JertNetworkKey { hardhat, sepolia }

class JertNetworkConfig {
  final JertNetworkKey key;
  final String label;
  final int chainId;
  final String rpcUrl;
  final String? explorerUrl;

  const JertNetworkConfig({
    required this.key,
    required this.label,
    required this.chainId,
    required this.rpcUrl,
    this.explorerUrl,
  });
}

const Map<JertNetworkKey, JertNetworkConfig> jertNetworks = {
  JertNetworkKey.hardhat: JertNetworkConfig(
    key: JertNetworkKey.hardhat,
    label: 'Localhost (Hardhat)',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
  ),
  JertNetworkKey.sepolia: JertNetworkConfig(
    key: JertNetworkKey.sepolia,
    label: 'Sepolia (Alchemy/Infura)',
    chainId: 11155111,
    rpcUrl: String.fromEnvironment('SEPOLIA_RPC_URL', defaultValue: ''),
    // если захочешь, можно добавить и explorerUrl
  ),
};

const JertNetworkKey defaultJertNetwork = JertNetworkKey.hardhat;

JertNetworkConfig getDefaultJertNetwork() {
  return jertNetworks[defaultJertNetwork]!;
}
