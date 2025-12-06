import 'package:flutter/material.dart';
import '../services/wallet_service.dart';

class SendScreen extends StatefulWidget {
  final String fromAddress;

  const SendScreen({super.key, required this.fromAddress});

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  final _toController = TextEditingController();
  final _amountController = TextEditingController();
  final _walletService = WalletService();

  bool _sending = false;
  String? _error;
  String? _txHash;

  @override
  void dispose() {
    _toController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final to = _toController.text.trim();
    final amount = _amountController.text.trim();

    if (to.isEmpty || amount.isEmpty) {
      setState(() {
        _error = 'Enter recipient and amount';
      });
      return;
    }

    setState(() {
      _sending = true;
      _error = null;
      _txHash = null;
    });

    try {
      final hash = await _walletService.sendJert(
        from: widget.fromAddress,
        to: to,
        amountJert: amount,
      );
      setState(() {
        _txHash = hash;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to send: $e';
      });
    } finally {
      setState(() {
        _sending = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Send JERT'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              'From: ${widget.fromAddress}',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _toController,
              decoration: const InputDecoration(
                labelText: 'To address',
                hintText: '0x...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Amount (JERT)',
                border: OutlineInputBorder(),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 12),
            if (_sending) const LinearProgressIndicator(),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            if (_txHash != null) ...[
              const SizedBox(height: 8),
              Text(
                'Tx Hash:',
                style: theme.textTheme.bodySmall,
              ),
              SelectableText(
                _txHash!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: Colors.green,
                ),
              ),
            ],
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _sending ? null : _send,
                child: const Text('Send'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
