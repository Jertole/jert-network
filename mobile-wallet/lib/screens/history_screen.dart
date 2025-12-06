
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/wallet_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool _loading = true;
  String _error = '';
  String _address = '';
  List<Map<String, dynamic>> _txs = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final addr = await WalletService.getAddress();
      final rawList = await ApiService.getTxHistory(addr);

      setState(() {
        _address = addr;
        _txs = rawList
            .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load transactions: $e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF05060A),
      appBar: AppBar(
        title: const Text('Transaction History'),
        backgroundColor: const Color(0xFF0A0D14),
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        _error,
                        style: const TextStyle(color: Colors.redAccent),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadHistory,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: _txs.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          return Padding(
                            padding: const EdgeInsets.only(
                                left: 4, right: 4, bottom: 12),
                            child: Text(
                              'Address: $_address',
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12),
                            ),
                          );
                        }

                        final tx = _txs[index - 1];
                        return _buildTxCard(tx);
                      },
                    ),
                  ),
      ),
    );
  }

  Widget _buildTxCard(Map<String, dynamic> tx) {
    final hash = (tx['hash'] ?? '') as String;
    final value = tx['value']?.toString() ?? '0';
    final blockNumber = tx['blockNumber']?.toString() ?? '-';
    final ts = tx['timestamp'];

    String tsString = '';
    if (ts is int) {
      tsString =
          DateTime.fromMillisecondsSinceEpoch(ts * 1000).toIso8601String();
    } else if (ts is String) {
      tsString = ts;
    }

    return Card(
      color: const Color(0xFF0A0D14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              hash.isEmpty
                  ? 'Tx hash: —'
                  : 'Tx: ${hash.substring(0, 10)}…${hash.substring(hash.length - 6)}',
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 4),
            Text(
              'Value: $value JERT',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            Text(
              'Block: $blockNumber',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            Text(
              'Time: $tsString',
              style: const TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
