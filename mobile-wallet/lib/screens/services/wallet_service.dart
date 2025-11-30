import 'local_storage.dart';

class WalletService {
  WalletService._();
  static final WalletService instance = WalletService._();

  static const _addressKey = 'wallet_address';

  Future<String?> getCurrentAddress() async {
    return LocalStorage.instance.getString(_addressKey);
  }

  Future<void> setCurrentAddress(String address) async {
    await LocalStorage.instance.setString(_addressKey, address);
  }

  // TODO: сюда можно добавить генерацию ключей и импорт seed-фразы
}
