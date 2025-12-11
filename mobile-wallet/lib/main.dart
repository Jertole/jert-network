
import 'package:flutter/material.dart';

import 'services/wallet_service.dart';
import 'screens/home_screen.dart';
import 'screens/send_screen.dart';
import 'screens/history_screen.dart';

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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}

/// Сплэш: создаёт кошелёк и адрес, переходит на MainScreen.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  late final WalletService _walletService;

  @override
  void initState() {
    super.initState();
    _walletService = WalletService();
    _initWallet();
  }

  Future<void> _initWallet() async {
    final address = await _walletService.createOrLoadPrivateKey();

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => MainScreen(
          walletService: _walletService,
          address: address,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

/// Основной экран с BottomNavigationBar.
class MainScreen extends StatefulWidget {
  final WalletService walletService;
  final String address;

  const MainScreen({
    super.key,
    required this.walletService,
    required this.address,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      HomeScreen(
        walletService: widget.walletService,
        address: widget.address,
      ),
      SendScreen(
        fromAddress: widget.address,
        walletService: widget.walletService,
      ),
      HistoryScreen(
        walletService: widget.walletService,
        address: widget.address,
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (idx) {
          setState(() {
            _selectedIndex = idx;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.send),
            label: 'Send',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
        ],
      ),
    );
  }
}
