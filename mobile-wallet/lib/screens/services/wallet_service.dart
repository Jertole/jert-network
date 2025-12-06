
import 'package:shared_preferences/shared_preferences.dart';

/// Очень простой локальный кошелёк для прототипа мобильного приложения.
/// Хранит address и баланс в SharedPreferences.
///
/// ПОТОМ:
///  - можно заменить на web3dart + реальный private key
///  - или интегрировать с внешним хранилищем
class WalletService {
  static const _addressKey = 'wallet_address';
  static const _balanceKey = 'wallet_balance_jert';

  /// Возвращает текущий адрес кошелька.
  /// Если адреса нет — создаёт демо-адрес и сохраняет.
  static Future<String> getAddress() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_addressKey);

    if (stored != null && stored.isNotEmpty) {
      return stored;
    }

    // TODO: заменить на реальную генерацию EVM-адреса
    const demoAddress = '0xDEMO000000000000000000000000000000000001';
    await prefs.setString(_addressKey, demoAddress);
    return demoAddress;
  }

  /// Возвращает локально сохранённый баланс JERT.
  /// Пока это просто число в SharedPreferences.
  ///
  /// ПОТОМ:
  ///  - заменить на реальный RPC-запрос к smart-contract JERTToken.
  static Future<double> getBalance() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_balanceKey) ?? 0.0;
  }

  /// Устанавливает локальный баланс (для тестов, демо).
  /// Можно вызывать после отправки транзакции или для имитации прихода средств.
  static Future<void> setBalance(double newBalance) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_balanceKey, newBalance);
  }
}
