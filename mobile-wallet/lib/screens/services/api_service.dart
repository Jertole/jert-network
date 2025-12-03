// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl;

  ApiService({required this.baseUrl});

  Future<WalletBalance> getBalance(String address) async {
    final uri = Uri.parse('$baseUrl/wallet/balance?address=$address');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load balance');
    }

    final data = jsonDecode(resp.body);
    return WalletBalance.fromJson(data);
  }

  Future<List<TxHistoryItem>> getHistory(String address) async {
    final uri = Uri.parse('$baseUrl/tx/history?address=$address');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load history');
    }

    final list = jsonDecode(resp.body) as List;
    return list.map((e) => TxHistoryItem.fromJson(e)).toList();
  }

  Future<String> sendTransaction(String signedTx) async {
    final uri = Uri.parse('$baseUrl/tx/send');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'signedTx': signedTx}),
    );

    if (resp.statusCode != 200) {
      throw Exception('Failed to send transaction');
    }

    final data = jsonDecode(resp.body);
    return data['txHash'] as String;
  }
}

class WalletBalance {
  final String address;
  final double balanceJert;
  final double priceUsd;
  final double equivalentUsd;

  WalletBalance({
    required this.address,
    required this.balanceJert,
    required this.priceUsd,
    required this.equivalentUsd,
  });

  factory WalletBalance.fromJson(Map<String, dynamic> json) {
    return WalletBalance(
      address: json['address'] as String,
      balanceJert: double.parse(json['balanceJERT'].toString()),
      priceUsd: double.parse(json['priceUSD'].toString()),
      equivalentUsd: double.parse(json['equivalentUSD'].toString()),
    );
  }
}

class TxHistoryItem {
  final String hash;
  final String type; // IN or OUT
  final double amountJert;
  final double equivalentUsd;
  final String? time;

  TxHistoryItem({
    required this.hash,
    required this.type,
    required this.amountJert,
    required this.equivalentUsd,
    this.time,
  });

  factory TxHistoryItem.fromJson(Map<String, dynamic> json) {
    return TxHistoryItem(
      hash: json['hash'] as String,
      type: json['type'] as String,
      amountJert: double.parse(json['amountJERT'].toString()),
      equivalentUsd: double.parse(json['equivalentUSD'].toString()),
      time: json['time'] as String?,
    );
  }
}
