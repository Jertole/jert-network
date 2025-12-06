
import 'package:flutter/material.dart';
import '../services/wallet_service.dart';

class HistoryScreen extends StatefulWidget {
  final String address;

  const HistoryScreen({super.key, required this.address});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _walletService = WalletService();
  List<TxItem> _items = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final list = await _walletService.fetchHistory(widget.address);
      setState(() {
        _items = list;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load history: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Text(
              'Address: ${widget.address}',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            if (_loading) const LinearProgressIndicator(),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            const SizedBox(height: 8),
            Expanded(
              child: _items.isEmpty && !_loading
                  ? const Center(child: Text('No transactions found'))
                  : ListView.separated(
                      itemCount: _items.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final tx = _items[index];
                        return ListTile(
                          leading: Icon(
                            tx.status.toLowerCase() == 'success'
                                ? Icons.check_circle_outline
                                : Icons.hourglass_bottom,
                            color: tx.status.toLowerCase() == 'success'
                                ? Colors.green
                                : Colors.orange,
                          ),
                          title: Text(
                            '${tx.amountJert.toStringAsFixed(4)} JERT',
                            style: theme.textTheme.bodyLarge,
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('From: ${tx.from}'),
                              Text('To:   ${tx.to}'),
                              if (tx.timestamp != null)
                                Text('Time: ${tx.timestamp}'),
                            ],
                          ),
                          trailing: SizedBox(
                            width: 60,
                            child: Text(
                              tx.hash.length > 10
                                  ? '${tx.hash.substring(0, 6)}…${tx.hash.substring(tx.hash.length - 4)}'
                                  : tx.hash,
                              textAlign: TextAlign.right,
                              style: theme.textTheme.bodySmall,
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
