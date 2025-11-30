
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  /// Базовый URL API Gateway.
  /// Можно переопределить через --dart-define=JERT_API_URL=...
  final String baseUrl = const String.fromEnvironment(
    'JERT_API_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  Future<String> getBalance(String? address) async {
    if (address == null || address.isEmpty || address == 'Not set') {
      return '0.0000 JERT';
    }

    final uri = Uri.parse('$baseUrl/wallet/balance')
        .replace(queryParameters: {'address': address});

    try {
      final resp = await http.get(uri);

      if (resp.statusCode != 200) {
        return '0.0000 JERT';
      }

      final data = json.decode(resp.body) as Map<String, dynamic>;

      // backend отдаёт поле formatted
      final formatted = data['formatted'] as String? ?? '0.0000 JERT';
      return formatted;
    } catch (e) {
      // На всякий случай при ошибках не роняем UI
      return '0.0000 JERT';
    }
  }

Future<List<Map<String, dynamic>>> getHistory(String? address) async {
    if (address == null || address.isEmpty || address == 'Not set') {
      return [];
    }

    final uri = Uri.parse('$baseUrl/tx/history')
        .replace(queryParameters: {'address': address});

    try {
      final resp = await http.get(uri);
      if (resp.statusCode != 200) {
        return [];
      }

      final decoded = json.decode(resp.body);
      if (decoded is List) {
        return decoded.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
 
    // TODO: когда сделаем /api/tx/history — подключим сюда
    return [];
  }

  Future<String?> sendTransaction({
    required String from,
    required String to,
    required String amount,
  }) async {
    // TODO: позже свяжем с /api/tx/send
    return null;
  }
}
