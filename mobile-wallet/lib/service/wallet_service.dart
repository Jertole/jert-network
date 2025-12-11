
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';
import 'package:jert_network/config/jert_networks.dart';
import 'package:jert_network/config/jert_network_config.dart';
import 'package:jert_network/config/jert_token.dart';

class WalletService {
  static const _storage = FlutterSecureStorage();
  static const _pkKey = 'jert_wallet_private_key';
  static const _pinKey = 'jert_wallet_pin';

  final Web3Client _client;

  WalletService() : _client = Web3Client(jertRpcUrl, http.Client());

  Web3Client get client => _client;

  /// Уже есть кошелёк?
  Future<bool> hasWallet() async {
    final pk = await _storage.read(key: _pkKey);
    return pk != null && pk.isNotEmpty;
  }

  /// Есть ли PIN?
  Future<bool> hasPin() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_pinKey);
    return stored != null && stored.isNotEmpty;
  }

  /// Установить / сменить PIN
  Future<void> setPin(String pin) async {
    await _savePin(pin);
  }

  /// Создать кошелёк
  Future<EthereumAddress> createWallet({String? pin}) async {
    final creds = EthPrivateKey.createRandom();
    final pkHex = bytesToHex(creds.privateKey, include0x: true);

    await _storage.write(key: _pkKey, value: pkHex);
    if (pin != null && pin.isNotEmpty) {
      await _savePin(pin);
    }

    return creds.address;
  }

  /// Импорт кошелька
  Future<EthereumAddress> importWallet(String privateKey, {String? pin}) async {
    final pkTrimmed = privateKey.trim();
    if (!pkTrimmed.startsWith('0x') || pkTrimmed.length < 10) {
      throw ArgumentError('Invalid private key format');
    }

    final creds = EthPrivateKey.fromHex(pkTrimmed);

    await _storage.write(key: _pkKey, value: pkTrimmed);
    if (pin != null && pin.isNotEmpty) {
      await _savePin(pin);
    }

    return creds.address;
  }

  Future<void> _savePin(String pin) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_pinKey, pin);
  }

  Future<bool> verifyPin(String pin) async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_pinKey);
    return stored != null && stored == pin;
  }

  /// Адрес кошелька
  Future<EthereumAddress?> getAddress() async {
    final pk = await _storage.read(key: _pkKey);
    if (pk == null) return null;
    final creds = EthPrivateKey.fromHex(pk);
    return creds.address;
  }

  /// Баланс ETH
  Future<EtherAmount> getEthBalance(EthereumAddress address) async {
    return _client.getBalance(address);
  }

  /// Баланс JERT (ERC-20)
  Future<BigInt> getJertBalance(EthereumAddress address) async {
    final contract = DeployedContract(
      ContractAbi.fromJson(_jertAbiJson, 'JERTToken'),
      EthereumAddress.fromHex(jertTokenAddress),
    );

    final balanceOf = contract.function('balanceOf');

    final result = await _client.call(
      contract: contract,
      function: balanceOf,
      params: [address],
    );

    return result.first as BigInt;
  }

  /// Отправка JERT
  Future<String> sendJert({
    required String to,
    required BigInt amount,
  }) async {
    final pk = await _storage.read(key: _pkKey);
    if (pk == null) {
      throw StateError('Wallet not initialized');
    }

    final credentials = EthPrivateKey.fromHex(pk);

    final contract = DeployedContract(
      ContractAbi.fromJson(_jertAbiJson, 'JERTToken'),
      EthereumAddress.fromHex(jertTokenAddress),
    );

    final transfer = contract.function('transfer');

    final tx = Transaction.callContract(
      contract: contract,
      function: transfer,
      parameters: [EthereumAddress.fromHex(to), amount],
      chainId: jertChainId,
    );

    final txHash = await _client.sendTransaction(
      credentials,
      tx,
      chainId: jertChainId,
    );

    return txHash;
  }

  /// Отправка ETH
  Future<String> sendEth({
    required String to,
    required EtherAmount amount,
  }) async {
    final pk = await _storage.read(key: _pkKey);
    if (pk == null) {
      throw StateError('Wallet not initialized');
    }

    final credentials = EthPrivateKey.fromHex(pk);

    final tx = Transaction(
      to: EthereumAddress.fromHex(to),
      value: amount,
      chainId: jertChainId,
    );

    final txHash = await _client.sendTransaction(
      credentials,
      tx,
      chainId: jertChainId,
    );

    return txHash;
  }

  /// История транзакций через API Gateway
  Future<List<Map<String, dynamic>>> getTransactionHistory() async {
    final addr = await getAddress();
    if (addr == null) return [];

    final addrStr = addr.toString();
    final uri = Uri.parse('$jertApiBaseUrl/tx/history?address=$addrStr');

    final resp = await http.get(uri, headers: {
      'Accept': 'application/json',
    });

    if (resp.statusCode != 200) {
      return [];
    }

    final decoded = jsonDecode(resp.body) as Map<String, dynamic>;
    final raw = decoded['items'] as List<dynamic>? ?? [];

    return raw
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  /// Минимальный ABI JERTToken
  static const String _jertAbiJson = '''
  [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "recipient", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ]
  ''';
}
