
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;

class WalletService {
  final Web3Client client;
  final String privateKey;

  WalletService({
    required String rpcUrl,
    required this.privateKey,
  }) : client = Web3Client(rpcUrl, http.Client());

  Credentials get _credentials => EthPrivateKey.fromHex(privateKey);

  Future<EtherAmount> getBalance(String address) async {
    final balance = await client.getBalance(
      EthereumAddress.fromHex(address),
    );
    return balance;
  }

  Future<String> sendNative({
    required String to,
    required BigInt amountWei,
  }) async {
    final tx = Transaction(
      to: EthereumAddress.fromHex(to),
      value: EtherAmount.inWei(amountWei),
    );

    final txHash = await client.sendTransaction(
      _credentials,
      tx,
      chainId: null,
    );
    return txHash;
  }
}
