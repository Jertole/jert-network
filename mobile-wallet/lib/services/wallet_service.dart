
import 'dart:math';

import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';

import '../config/jert_network_config.dart';

/// Простая модель баланса кошелька:
/// nativeBalance — ETH/SEPOLIA в wei
/// tokenBalance  — баланс JERT в wei (пока заглушка)
class WalletBalance {
  final BigInt nativeBalance;
  final BigInt tokenBalance;

  WalletBalance({
    required this.nativeBalance,
    required this.tokenBalance,
  });
}

/// Простая модель транзакции для истории.
class TxItem {
  final String hash;
  final String from;
  final String to;
  final BigInt value;
  final DateTime timestamp;

  TxItem({
    required this.hash,
    required this.from,
    required this.to,
    required this.value,
    required this.timestamp,
  });
}

/// Основной сервис кошелька.
/// ВАЖНО: есть конструктор БЕЗ параметров, как в твоём main.dart.
class WalletService {
  late final Web3Client client;

  /// Приватный ключ, который мы создаём/загружаем через createOrLoadPrivateKey().
  String? _privateKeyHex;

  WalletService() {
    // Берём RPC из сети по умолчанию (Sepolia/Hardhat, как настроишь в jert_network_config.dart)
    final rpcUrl = defaultJertNetworkConfig.rpcUrl;
    client = Web3Client(rpcUrl, http.Client());
  }

  /// Вспомогательное: преобразуем hex-ключ в Credentials.
  Credentials _credentialsFromHex(String hex) {
    return EthPrivateKey.fromHex(hex);
  }

  /// Создаём НОВЫЙ приватный ключ (пока без сохранения в storage)
  /// или возвращаем уже созданный в рамках этого запуска.
  Future<String> createOrLoadPrivateKey() async {
    if (_privateKeyHex != null) return _privateKeyHex!;

    final rng = Random.secure();
    final key = EthPrivateKey.createRandom(rng);
    final bytes = await key.extractPrivateKeyBytes();

    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    _privateKeyHex = hex;
    return hex;
  }

  /// Получение баланса кошелька по адресу.
  Future<WalletBalance> fetchBalance(String address) async {
    final ethAddress = EthereumAddress.fromHex(address);
    final native = await client.getBalance(ethAddress);

    // Здесь потом можно добавить реальное чтение баланса JERT-токена.
    return WalletBalance(
      nativeBalance: native.getInWei,
      tokenBalance: BigInt.zero,
    );
  }

  /// Заглушка для истории транзакций.
  /// Сейчас просто возвращает пустой список, чтобы приложение собиралось.
  Future<List<TxItem>> fetchHistory(String address) async {
    // TODO: подключить реальную историю (Etherscan API и т.п.)
    return <TxItem>[];
  }

  /// Отправка "токена JERT".
  /// Пока для простоты шлём нативный токен сети (ETH/SEPOLIA) транзакцией.
  Future<String> sendJert({
    required String fromAddress,
    required String toAddress,
    required BigInt amountWei,
  }) async {
    final privateKeyHex = _privateKeyHex;
    if (privateKeyHex == null) {
      throw StateError(
        'Private key is not initialized. Call createOrLoadPrivateKey() first.',
      );
    }

    final credentials = _credentialsFromHex(privateKeyHex);

    final tx = Transaction(
      from: EthereumAddress.fromHex(fromAddress),
      to: EthereumAddress.fromHex(toAddress),
      value: EtherAmount.inWei(amountWei),
    );

    final hash = await client.sendTransaction(
      credentials,
      tx,
      chainId: defaultJertNetworkConfig.chainId,
    );
    return hash;
  }
}
