// lib/services/wallet_service.dart

import 'dart:math';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/jert_networks.dart';

/// Информация о балансе кошелька
class WalletBalance {
  final EtherAmount nativeBalance;
  final BigInt tokenBalance;

  const WalletBalance({
    required this.nativeBalance,
    required this.tokenBalance,
  });
}

/// Простейший элемент истории транзакций
class TxItem {
  final String hash;
  final BigInt value;
  final DateTime timestamp;

  const TxItem({
    required this.hash,
    required this.value,
    required this.timestamp,
  });
}

/// Основной сервис кошелька JERT для mobile-wallet
class WalletService {
  WalletService()
      : _client = Web3Client(jertRpcUrl, http.Client());

  final Web3Client _client;
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static const _privateKeyKey = 'jert_private_key';

  /// Создать или получить уже сохранённый приватный ключ
  Future<String> createOrLoadPrivateKey() async {
    final existing = await _storage.read(key: _privateKeyKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }

    final rng = Random.secure();
    final credentials = EthPrivateKey.createRandom(rng);
    final pkHex = _bytesToHex(credentials.privateKey);
    await _storage.write(key: _privateKeyKey, value: pkHex);
    return pkHex;
  }

  /// Получить адрес кошелька по сохранённому приватному ключу
  Future<EthereumAddress?> getAddress() async {
    final pk = await _storage.read(key: _privateKeyKey);
    if (pk == null || pk.isEmpty) return null;

    final credentials = EthPrivateKey.fromHex(pk);
    return credentials.address;
  }

  /// Загрузить баланс (native + JERT токен)
  Future<WalletBalance> loadBalance() async {
    final address = await getAddress();
    if (address == null) {
      return WalletBalance(
        nativeBalance: EtherAmount.zero(),
        tokenBalance: BigInt.zero,
      );
    }

    final native = await _client.getBalance(address);

    // TODO: вызвать JERT токен контракт, пока заглушка
    final token = BigInt.zero;

    return WalletBalance(
      nativeBalance: native,
      tokenBalance: token,
    );
  }

  /// Заглушка для истории транзакций
  Future<List<TxItem>> loadTxHistory() async {
    // TODO: подключить реальный backend / explorer API
    return <TxItem>[];
  }

  /// Хелпер: bytes -> hex
  String _bytesToHex(Uint8List bytes) {
    final StringBuffer buffer = StringBuffer();
    for (final b in bytes) {
      buffer.write(b.toRadixString(16).padLeft(2, '0'));
    }
    return buffer.toString();
  }
}
