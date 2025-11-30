
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  LocalStorage._();
  static final LocalStorage instance = LocalStorage._();

  Future<SharedPreferences> get _prefs async => SharedPreferences.getInstance();

  Future<String?> getString(String key) async {
    final p = await _prefs;
    return p.getString(key);
  }

  Future<void> setString(String key, String value) async {
    final p = await _prefs;
    await p.setString(key, value);
  }
