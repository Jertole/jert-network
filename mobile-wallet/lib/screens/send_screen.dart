
import 'package:flutter/material.dart';

class SendScreen extends StatelessWidget {
  final String address;

  const SendScreen({super.key, required this.address});

  @override
  Widget build(BuildContext context) {
    final toController = TextEditingController();
    final amountController = TextEditingController();

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
              'From: $address',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: toController,
              decoration: const InputDecoration(
                labelText: 'To address',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Amount (JERT)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // TODO: вызвать ApiService для отправки транзакции
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Send flow not yet implemented')),
                );
              },
              child: const Text('Send'),
            ),
          ],
        ),
      ),
    );
  }
}
