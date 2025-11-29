import 'package:flutter/material.dart';

void main() {
  runApp(const JertWalletApp());
}

class JertWalletApp extends StatelessWidget {
  const JertWalletApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JERT Wallet',
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00E5FF),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF05070B),
        useMaterial3: true,
      ),
      home: const WalletHomeScreen(),
    );
  }
}

class WalletHomeScreen extends StatelessWidget {
  const WalletHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('JERT Wallet'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Баланс
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Balance',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '0.0000 JERT',
                      style:
                          TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '~ 0.00 USD (6 currencies later)',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Кнопки Send / Receive / Buy / Sell
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _WalletActionButton(
                  icon: Icons.call_made,
                  label: 'Send',
                  onTap: () {
                    // TODO: Navigate to send screen
                  },
                ),
                _WalletActionButton(
                  icon: Icons.call_received,
                  label: 'Receive',
                  onTap: () {
                    // TODO: Show receive address/QR
                  },
                ),
                _WalletActionButton(
                  icon: Icons.shopping_cart_outlined,
                  label: 'Buy',
                  onTap: () {
                    // TODO: integration later
                  },
                ),
                _WalletActionButton(
                  icon: Icons.sell_outlined,
                  label: 'Sell',
                  onTap: () {
                    // TODO: integration later
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text(
              'Transactions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView.builder(
                itemCount: 0, // TODO: заполнить после API
                itemBuilder: (context, index) {
                  // временный заглушечный список
                  return const ListTile(
                    title: Text('No transactions yet'),
                    dense: true,
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

class _WalletActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _WalletActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          borderRadius: BorderRadius.circular(32),
          onTap: onTap,
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.cyanAccent,
              ),
            ),
            child: Icon(icon, size: 28),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        )
      ],
    );
  }
}
