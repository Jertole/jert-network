
import 'dart:convert';
import 'package:flutter/services.dart';

class ContractConfig {
  static late final String jertToken;
  static late final String treasuryMultisig;
  static late final String kycRegistry;
  static late final String complianceGateway;
  static late final String leaseContract;

  static late final String rpcUrl;
  static late final String apiUrl;

  /// Load from JSON + ENV
  static Future<void> load() async {
    final jsonString = await rootBundle
        .loadString('assets/config/contract-addresses.json');

    final data = json.decode(jsonString);

    jertToken = data['JERTToken'];
    treasuryMultisig = data['TreasuryMultisig'];
    kycRegistry = data['KYCRegistry'];
    complianceGateway = data['ComplianceGateway'];
    leaseContract = data['LeaseContract'];

    rpcUrl = const String.fromEnvironment(
          'FLUTTER_JERT_RPC_URL',
          defaultValue: 'http://127.0.0.1:8545',
        );

    apiUrl = const String.fromEnvironment(
          'FLUTTER_API_URL',
          defaultValue: 'http://localhost:3001',
        );
  }
}
