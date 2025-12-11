
import 'package:flutter/material.dart';

import '../services/wallet_service.dart';
import '../widgets/jert_balance_card.dart';

class HomeScreen extends StatefulWidget {
  final WalletService walletService;
  final String address;

  const HomeScreen({
    super.key,
    required this.walletService,
    required this.address,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  WalletBalance? _balance;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBalance();
  }

  Future<void> _loadBalance() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final balance =
          await widget.walletService.fetchBalance(widget.address);
      setState(() {
        _balance = balance;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: _loadBalance,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'JERT Wallet',
            style: theme.textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Address:',
            style: theme.textTheme.labelMedium,
          ),
          const SizedBox(height: 4),
          SelectableText(
            widget.address,
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 16),

          if (_isLoading) ...[
            const Center(child: CircularProgressIndicator()),
          ] else if (_error != null) ...[
            Text(
              'Error: $_error',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _loadBalance,
              child: const Text('Retry'),
            ),
          ] else if (_balance != null) ...[
            JertBalanceCard(balance: _balance!),
          ] else ...[
            const Text('No balance data'),
          ],
        ],
      ),
    );
  }
}
