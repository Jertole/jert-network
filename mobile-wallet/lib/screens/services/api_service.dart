import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  final String baseUrl = const String.fromEnvironment(
    'JERT_API_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  Future<String> getBalance(String? address) async {
    if (address == null || address == 'Not set') {
      return '0.0000 JERT';
    }

    // TODO: реальный запрос к API, сейчас просто заглушка
    // final resp = await http.get(Uri.parse('$baseUrl/wallet/balance?address=$address'));
    // parse...
    return '0.0000 JERT';
  }

  Future<List<Map<String, dynamic>>> getHistory(String? address) async {
    if (address == null) return [];
    // TODO: реальный запрос к /api/tx/history
    return [];
  }

  Future<String?> sendTransaction({
    required String from,
    required String to,
    required String amount,
  }) async {
    // TODO: подписать и отправить транзакцию через backend
    return null;
  }
}
