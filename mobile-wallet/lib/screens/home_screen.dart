// mobile-wallet/lib/screens/home_screen.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  final ApiService api;

  const HomeScreen({super.key, required this.api});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _addressController = TextEditingController();
  WalletBalance? _balance;
  List<TxHistoryItem> _history = [];
  bool _loading = false;
  String? _error;

  Future<void> _loadData() async {
    final addr = _addressController.text.trim();
    if (addr.isEmpty) {
      setState(() {
        _error = "Please enter wallet address.";
      });
      return;
    }
    setState(() {
      _error = null;
      _loading = true;
    });

    try {
      final bal = await widget.api.getBalance(addr);
      final hist = await widget.api.getHistory(addr);
      setState(() {
        _balance = bal;
        _history = hist;
      });
    } catch (e) {
      setState(() {
        _error = "Failed to load data: $e";
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("JERT Wallet — USD"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: "Wallet address",
                hintText: "0x...",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  onPressed: _loading ? null : _loadData,
                  child: _loading
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("Load"),
                ),
                const SizedBox(width: 12),
                if (_error != null)
                  Expanded(
                    child: Text(
                      _error!,
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.redAccent),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (_balance != null) _buildBalanceCard(theme),
            const SizedBox(height: 16),
            Expanded(child: _buildHistoryList(theme)),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard(ThemeData theme) {
    final bal = _balance!;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.tealAccent.withOpacity(0.5)),
        color: Colors.black.withOpacity(0.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Balance",
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 4),
          Text(
            "${bal.balanceJert.toStringAsFixed(2)} JERT",
            style: theme.textTheme.headlineSmall,
          ),
          const SizedBox(height: 2),
          Text(
            "\$${bal.equivalentUsd.toStringAsFixed(2)} USD",
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: Colors.grey.shade300),
          ),
          const SizedBox(height: 4),
          Text(
            "Price: \$${bal.priceUsd.toStringAsFixed(6)} per JERT",
            style: theme.textTheme.bodySmall
                ?.copyWith(color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(ThemeData theme) {
    if (_history.isEmpty) {
      return Center(
        child: Text(
          "No transactions yet.",
          style: theme.textTheme.bodyMedium
              ?.copyWith(color: Colors.grey.shade400),
        ),
      );
    }

    return ListView.separated(
      itemCount: _history.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final tx = _history[index];
        final isIn = tx.type == "IN";
        final color = isIn ? Colors.greenAccent : Colors.redAccent;
        final sign = isIn ? "+" : "-";

        return ListTile(
          dense: true,
          title: Text(
            "$sign${tx.amountJert.toStringAsFixed(4)} JERT"
            "   (\$${tx.equivalentUsd.toStringAsFixed(2)} USD)",
            style: theme.textTheme.bodyMedium?.copyWith(color: color),
          ),
          subtitle: Text(
            tx.time ?? tx.hash,
            style: theme.textTheme.bodySmall
                ?.copyWith(color: Colors.grey.shade400),
          ),
        );
      },
    );
  }
}
