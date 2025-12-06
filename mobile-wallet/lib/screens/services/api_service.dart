import 'dart:convert';
import 'package:http/http.dart' as http;

/// Сервис работы с JERT API Gateway
///
/// ВАЖНО: поменяй [baseUrl] на реальный адрес своего API:
///  - локально:  http://localhost:3000
///  - прод:      https://api.jert.kz  (пример)
class ApiService {
  static const String baseUrl = 'http://localhost:3000'; // TODO: изменить при деплое

  /// GET /energy/rates
  /// Возвращает текущие конверсионные правила и USD-ставки
  static Future<Map<String, dynamic>> getEnergyRates() async {
    final uri = Uri.parse('$baseUrl/energy/rates');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load energy rates: ${resp.statusCode}');
    }

    final data = json.decode(resp.body) as Map<String, dynamic>;
    return data;
  }

  /// GET /energy/convert?jert=X
  /// Возвращает energyMWhEquivalent и coldMWhEquivalent
  static Future<Map<String, dynamic>> convertJert(double jert) async {
    final uri = Uri.parse('$baseUrl/energy/convert?jert=$jert');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to convert JERT: ${resp.statusCode}');
    }

    final data = json.decode(resp.body) as Map<String, dynamic>;
    return data;
  }

  /// (опционально на будущее) GET /tx/history?address=0x...
  static Future<List<dynamic>> getTxHistory(String address) async {
    final uri = Uri.parse('$baseUrl/tx/history?address=$address');
    final resp = await http.get(uri);

    if (resp.statusCode != 200) {
      throw Exception('Failed to load tx history: ${resp.statusCode}');
    }

    final data = json.decode(resp.body) as Map<String, dynamic>;
    return (data['history'] as List?) ?? <dynamic>[];
  }

  /// (опционально) POST /tx/send с уже подписанной транзакцией
  static Future<Map<String, dynamic>> sendRawTx(String rawTx) async {
    final uri = Uri.parse('$baseUrl/tx/send');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'rawTx': rawTx}),
    );

    if (resp.statusCode != 200) {
      throw Exception('Failed to send tx: ${resp.statusCode}');
    }

    return json.decode(resp.body) as Map<String, dynamic>;
  }
}
