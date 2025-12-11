
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;

class WalletService {
  final Web3Client client;
  final String privateKey;

  Credentials get credentials => EthPrivateKey.fromHex(privateKey);

  WalletService({
    required String rpcUrl,
    required this.privateKey,
  }) : client = Web3Client(rpcUrl, http.Client());

  Future<EtherAmount> getBalance(String address) async {
    final balance = await client.getBalance(EthereumAddress.fromHex(address));
    return balance;
  }

  Future<String> send(String to, BigInt amount) async {
    final tx = Transaction(
      to: EthereumAddress.fromHex(to),
      value: EtherAmount.inWei(amount),
      gasPrice: EtherAmount.inWei(BigInt.one),
    );

    final result = await client.sendTransaction(
      credentials,
      tx,
      chainId: null,
    );

    return result;
  }
}
