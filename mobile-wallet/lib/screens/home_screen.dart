import 'package:flutter/material.dart';
import '../services/wallet_service.dart';
import 'send_screen.dart';
import 'history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _addressController = TextEditingController();
  final _walletService = WalletService();

  WalletBalance? _balance;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _loadBalance() async {
    final address = _addressController.text.trim();
    if (address.isEmpty) {
      setState(() {
        _error = 'Enter wallet address';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final bal = await _walletService.fetchBalance(address);
      setState(() {
        _balance = bal;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load balance: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _openSend() {
    final address = _addressController.text.trim();
    if (address.isEmpty) {
      setState(() {
        _error = 'Enter wallet address first';
      });
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SendScreen(fromAddress: address),
      ),
    );
  }

  void _openHistory() {
    final address = _addressController.text.trim();
    if (address.isEmpty) {
      setState(() {
        _error = 'Enter wallet address first';
      });
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => HistoryScreen(address: address),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('JERT Mobile Wallet'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Wallet address',
                hintText: '0x...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton(
                  onPressed: _loading ? null : _loadBalance,
                  child: const Text('Load Balance'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _openSend,
                  child: const Text('Send'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _openHistory,
                  child: const Text('History'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_loading) const CircularProgressIndicator(),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            const SizedBox(height: 16),
            if (_balance != null) _buildBalanceCard(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(ThemeData theme) {
    final b = _balance!;
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Address:',
              style: theme.textTheme.bodySmall,
            ),
            Text(
              b.address.isEmpty ? _addressController.text.trim() : b.address,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Balance',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('JERT'),
                Text(b.balanceJert.toStringAsFixed(4)),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('USD (reference)'),
                Text(b.balanceUsd.toStringAsFixed(2)),
              ],
            ),
            const Divider(height: 20),
            Text(
              'Energy Equivalent',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('MWh (electric/thermal)'),
                Text(b.energyMwh.toStringAsFixed(4)),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('MWh-cold (cryogenic)'),
                Text(b.energyMwhCold.toStringAsFixed(4)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
