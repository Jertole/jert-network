
import 'package:flutter/material.dart';

import '../services/wallet_service.dart';

class HistoryScreen extends StatefulWidget {
  final WalletService walletService;
  final String address;

  const HistoryScreen({
    super.key,
    required this.walletService,
    required this.address,
  });

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<TxItem> _history = const [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final items =
          await widget.walletService.fetchHistory(widget.address);
      setState(() {
        _history = items;
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
      onRefresh: _loadHistory,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Transaction History',
            style: theme.textTheme.headlineSmall,
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
              onPressed: _loadHistory,
              child: const Text('Retry'),
            ),
          ] else if (_history.isEmpty) ...[
            const Text('No transactions yet'),
          ] else ...[
            for (final tx in _history)
              Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(
                    'To: ${tx.to}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    'Hash: ${tx.hash}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${tx.amountJert.toStringAsFixed(4)} JERT',
                        style: theme.textTheme.bodyMedium,
                      ),
                      Text(
                        tx.status,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}
