--import 'api_service.dart';

class WalletService {
  final ApiService api;

  WalletService({ApiService? apiService}) : api = apiService ?? ApiService();

  Future<WalletBalance> fetchBalance(String address) async {
    final json = await api.getBalance(address);
    return WalletBalance.fromJson(json);
  }

  Future<List<TxItem>> fetchHistory(String address) async {
    final list = await api.getHistory(address);
    return list.map((e) => TxItem.fromJson(e)).toList();
  }

  Future<String> sendJert({
    required String from,
    required String to,
    required String amountJert,
  }) async {
    return api.sendTransaction(from: from, to: to, amountJert: amountJert);
  }
}

class WalletBalance {
  final String address;
  final double balanceJert;
  final double balanceUsd;
  final double energyMwh;
  final double energyMwhCold;

  WalletBalance({
    required this.address,
    required this.balanceJert,
    required this.balanceUsd,
    required this.energyMwh,
    required this.energyMwhCold,
  });

  factory WalletBalance.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v) ?? 0.0;
      return 0.0;
    }

    return WalletBalance(
      address: json['address']?.toString() ?? '',
      balanceJert: parseNum(json['balanceJert'] ?? json['jert']),
      balanceUsd: parseNum(json['balanceUsd'] ?? json['usd']),
      energyMwh: parseNum(json['energyMwh'] ?? json['mwh']),
      energyMwhCold: parseNum(json['energyMwhCold'] ?? json['mwhCold']),
    );
  }
}

class TxItem {
  final String hash;
  final String from;
  final String to;
  final double amountJert;
  final String status;
  final DateTime? timestamp;

  TxItem({
    required this.hash,
    required this.from,
    required this.to,
    required this.amountJert,
    required this.status,
    this.timestamp,
  });

  factory TxItem.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v) ?? 0.0;
      return 0.0;
    }

    DateTime? ts;
    if (json['timestamp'] != null) {
      try {
        ts = DateTime.parse(json['timestamp'].toString());
      } catch (_) {}
    }

    return TxItem(
      hash: json['hash']?.toString() ?? '',
      from: json['from']?.toString() ?? '',
      to: json['to']?.toString() ?? '',
      amountJert: parseNum(json['amountJert'] ?? json['amount']),
      status: json['status']?.toString() ?? 'unknown',
      timestamp: ts,
    );
  }
}
