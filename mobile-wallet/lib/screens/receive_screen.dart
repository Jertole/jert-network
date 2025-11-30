
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class ReceiveScreen extends StatelessWidget {
  final String address;

  const ReceiveScreen({super.key, required this.address});

  @override
  Widget build(BuildContext context) {
    final effectiveAddress = address.isEmpty || address == 'Not set'
        ? 'no-address'
        : address;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Receive JERT'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text(
              'Your address',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            SelectableText(
              address,
              style: const TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 24),
            QrImageView(
              data: effectiveAddress,
              version: QrVersions.auto,
              size: 200.0,
            ),
            const SizedBox(height: 12),
            const Text(
              'Scan this QR to receive JERT tokens.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
