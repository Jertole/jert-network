
import 'dart:math';

import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';

import '../config/jert_network_config.dart';

/// Баланс кошелька + производные показатели для UI.
class WalletBalance {
  final String address;
  final EtherAmount nativeBalance; // ETH/SEPOLIA
  final BigInt tokenBalance;       // JERT в wei (заглушка)

  WalletBalance({
    required this.address,
    required this.nativeBalance,
    required this.tokenBalance,
  });

  /// ETH / SEPOLIA
  double get balanceEth =>
      nativeBalance.getValueInUnit(EtherUnit.ether).toDouble();

  /// Баланс JERT (пока просто 0)
  double get balanceJert => tokenBalance.toDouble() / 1e18;

  /// Условный эквивалент в USD (для UI, пока заглушка)
  double get balanceUsd => balanceJert * 1.0;

  /// Условная энергия в MWh (для UI)
  double get energyMwh => balanceJert * 0.001;

  /// Условная "холодная энергия" в MWh (для UI)
  double get energyMwhCold => balanceJert * 0.0015;
}

/// Транзакция для истории.
class TxItem {
  final String hash;
  final String from;
  final String to;
  final BigInt valueWei;
  final DateTime timestamp;
  final String status;     // success / pending / failed
  final double amountJert; // для UI

  TxItem({
    required this.hash,
    required this.from,
    required this.to,
    required this.valueWei,
    required this.timestamp,
    this.status = 'success',
    double? amountJert,
  }) : amountJert = amountJert ?? valueWei.toDouble() / 1e18;
}

/// Основной сервис кошелька.
class WalletService {
  late final Web3Client client;

  EthPrivateKey? _credentials;
  String? _address;

  WalletService() {
    final rpcUrl = defaultJertNetworkConfig.rpcUrl;
    client = Web3Client(rpcUrl, http.Client());
  }

  /// Создать (или вернуть уже созданный) приватный ключ и адрес.
  Future<String> createOrLoadPrivateKey() async {
    if (_address != null) return _address!;

    _credentials = EthPrivateKey.createRandom(Random.secure());
   // ignore: deprecated_member_use final addr = await _credentials!.extractAddress();
    _address = ethAddress.hexEip55;
    return _address!;
  }

  Future<EthPrivateKey> _getCredentials() async {
    if (_credentials != null) return _credentials!;
    await createOrLoadPrivateKey();
    return _credentials!;
  }

  /// Получить баланс кошелька.
  Future<WalletBalance> fetchBalance(String address) async {
    final ethAddress = EthereumAddress.fromHex(address);
    final native = await client.getBalance(ethAddress);

    // Здесь позже добавится реальный баланс JERT-токена.
    return WalletBalance(
      address: address,
      nativeBalance: native,
      tokenBalance: BigInt.zero,
    );
  }

  /// Заглушка: история транзакций — пока пустой список.
  Future<List<TxItem>> fetchHistory(String address) async {
    return <TxItem>[];
  }

  /// Отправка "JERT" — пока шлём нативный токен сети.
  Future<String> sendJert({
    required String fromAddress,
    required String toAddress,
    required BigInt amountWei,
  }) async {
    final creds = await _getCredentials();

    final tx = Transaction(
      from: EthereumAddress.fromHex(fromAddress),
      to: EthereumAddress.fromHex(toAddress),
      value: EtherAmount.inWei(amountWei),
    );

    final hash = await client.sendTransaction(
      creds,
      tx,
      chainId: defaultJertNetworkConfig.chainId,
    );

    return hash;
  }
}
