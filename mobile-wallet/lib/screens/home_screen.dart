import 'package: flutter/material.dart';
import '../services/api_service.dart';
import '../services/wallet_service.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'history_screen.dart';
import 'setting_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState(Future<void> _openSettings() async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => SettingsScreen(currentAddress: _address),
      ),
    );

    if (changed == true) {
      // пересчитываем адрес и баланс
      await _loadData();
  
    }
  }
class _HomeScreenState extends State<HomeScreen> {
  String _balance = '0.0000 JERT';
  String _fiat = '~ 0.00 USD';
  int _currentIndex = 0;
  String _address = '—';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final addr = await WalletService.instance.getCurrentAddress();
    final bal = await ApiService.instance.getBalance(addr);
    // в будущем сюда можно добавить конвертацию в фиат
    setState(() {
      _address = addr ?? 'Not set';
      _balance = bal;
      _fiat = '~ 0.00 (multi-currency later)';
    });
  }

  void _onNavTap(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildDashboard();
      case 1:
        return SendScreen(address: _address);
      case 2:
        return ReceiveScreen(address: _address);
      case 3:
        return const HistoryScreen();
      default:
        return _buildDashboard();
    }
  }

  Widget _buildDashboard() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Balance',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _balance,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _fiat,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Address',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _address,
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Quick Actions',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _WalletActionButton(
                icon: Icons.call_made,
                label: 'Send',
                onTap: () => _onNavTap(1),
              ),
              _WalletActionButton(
                icon: Icons.call_received,
                label: 'Receive',
                onTap: () => _onNavTap(2),
              ),
              _WalletActionButton(
                icon: Icons.history,
                label: 'History',
                onTap: () => _onNavTap(3),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Transactions',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Expanded(
            child: HistoryScreen(
              embedded: true,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('JERT Wallet'),
        centerTitle: true,
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onNavTap,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.call_made), label: 'Send'),
          BottomNavigationBarItem(icon: Icon(Icons.call_received), label: 'Receive'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
        ],
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
