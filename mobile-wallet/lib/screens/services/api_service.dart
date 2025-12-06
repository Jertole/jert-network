
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl;

  ApiService({
    this.baseUrl = const String.fromEnvironment(
      'JERT_API_URL',
      defaultValue: 'http://127.0.0.1:4000',
    ),
  });

  Future<Map<String, dynamic>> getBalance(String address) async {
    final uri = Uri.parse('$baseUrl/wallet/balance?address=$address');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load balance: ${resp.statusCode}');
    }

    return jsonDecode(resp.body) as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getHistory(String address) async {
    final uri = Uri.parse('$baseUrl/wallet/history?address=$address');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load history: ${resp.statusCode}');
    }

    final data = jsonDecode(resp.body);
    if (data is List) {
      return data.cast<Map<String, dynamic>>();
    }
    if (data is Map && data['items'] is List) {
      return (data['items'] as List).cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<String> sendTransaction({
    required String from,
    required String to,
    required String amountJert,
  }) async {
    final uri = Uri.parse('$baseUrl/tx/send');
    final body = jsonEncode({
      'from': from,
      'to': to,
      'amountJert': amountJert,
    });

    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );

    if (resp.statusCode != 200 && resp.statusCode != 201) {
      throw Exception('Failed to send tx: ${resp.body}');
    }

    final data = jsonDecode(resp.body) as Map<String, dynamic>;
    return (data['txHash'] ?? data['hash'] ?? '').toString();
  }
}
