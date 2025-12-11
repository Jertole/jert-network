
import 'package:flutter/material.dart';

import '../config/jert_network_config.dart';
import '../services/wallet_service.dart';

class JertBalanceCard extends StatelessWidget {
  final WalletBalance balance;

  const JertBalanceCard({
    super.key,
    required this.balance,
  });

  @override
  Widget build(BuildContext context) {
    final network = defaultJertNetworkConfig;

    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Network: ${network.info.name}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Address:',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            Text(
              balance.address,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Text('Native balance: ${balance.balanceEth.toStringAsFixed(6)}'),
            Text('JERT balance: ${balance.balanceJert.toStringAsFixed(4)}'),
            const SizedBox(height: 12),
            Text('USD value: ${balance.balanceUsd.toStringAsFixed(2)}'),
            Text('Energy (MWh): ${balance.energyMwh.toStringAsFixed(4)}'),
            Text('Cold Energy (MWh): ${balance.energyMwhCold.toStringAsFixed(4)}'),
          ],
        ),
      ),
    );
  }
}
