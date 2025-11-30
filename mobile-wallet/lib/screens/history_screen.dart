import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HistoryScreen extends StatefulWidget {
  final bool embedded;
  final String address;

  const HistoryScreen({
    super.key,
    this.embedded = false,
    required this.address,
  });

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await ApiService.instance.getHistory(widget.address);
    setState(() {
      _items = data;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final list = _loading
        ? const Center(child: CircularProgressIndicator())
        : (_items.isEmpty
            ? const Center(
                child: Text(
                  'No transactions yet',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              )
            : ListView.builder(
                itemCount: _items.length,
                itemBuilder: (context, index) {
                  final tx = _items[index];
                  return ListTile(
                    title: Text(
                      tx['hash'] ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12),
                    ),
                    subtitle: Text(
                      '${tx['type'] ?? ''} • ${tx['amount'] ?? ''}',
                      style: const TextStyle(fontSize: 11),
                    ),
                    trailing: Text(
                      tx['blockNumber']?.toString() ?? '',
                      style: const TextStyle(fontSize: 11),
                    ),
                    dense: true,
                  );
                },
              ));

    if (widget.embedded) {
      return list;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: list,
      ),
    );
  }
}
