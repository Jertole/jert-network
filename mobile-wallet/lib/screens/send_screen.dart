import 'package: flutter/material.dart';
import '../services/api_service.dart';

class SendScreen extends StatefulWidget {
  final String address;

  const SendScreen({super.key, required this.address});

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  final TextEditingController _toController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  bool _sending = false;

  Future<void> _send() async {
    final to = _toController.text.trim();
    final amount = _amountController.text.trim();

    if (to.isEmpty || amount.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill address and amount')),
      );
      return;
    }

    setState(() {
      _sending = true;
    });

    final txHash = await ApiService.instance.sendTransaction(
      from: widget.address,
      to: to,
      amount: amount,
    );

    setState(() {
      _sending = false;
    });

    if (txHash == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transaction failed')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sent! txHash: $txHash')),
      );
      _amountController.clear();
      // История подтянется при следующей перезагрузке HistoryScreen
    }
  }

  @override
  void dispose() {
    _toController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Send JERT'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'From: ${widget.address}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _toController,
              decoration: const InputDecoration(
                labelText: 'To address',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Amount (JERT)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _sending ? null : _send,
              child: _sending
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Send'),
            ),
          ],
        ),
      ),
    );
  }
}
