import 'package:flutter/material.dart';

class HistoryScreen extends StatelessWidget {
  final bool embedded;

  const HistoryScreen({super.key, this.embedded = false});

  @override
  Widget build(BuildContext context) {
    final content = ListView.builder(
      itemCount: 0, // TODO: заполнить из API
      itemBuilder: (context, index) {
        return const ListTile(
          title: Text('No transactions yet'),
          dense: true,
        );
      },
    );

    if (embedded) {
      return content;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: content,
      ),
    );
  }
}

