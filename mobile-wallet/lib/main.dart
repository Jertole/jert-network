
import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'screens/history_screen.dart';
import 'screens/send_screen.dart';
import 'screens/setting_screen.dart';
import 'services/wallet_service.dart';

void main() {
  runApp(const JertApp());
}

class JertApp extends StatelessWidget {
  const JertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JERT Mobile Wallet',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final WalletService _walletService = WalletService();

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _walletService.createOrLoadPrivateKey();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const MainScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _index = 0;
  final WalletService _walletService = WalletService();

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeScreen(walletService: _walletService),
      HistoryScreen(walletService: _walletService),
      SendScreen(walletService: _walletService),
      SettingScreen(walletService: _walletService),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.send),
            label: 'Send',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
