
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Простая обёртка над secure storage
class LocalStorage {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static Future<void> saveString(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  static Future<String?> readString(String key) async {
    return _storage.read(key: key);
  }

  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
}
