
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/wallet_service.dart';
import 'send_screen.dart';
import 'receive_screen.dart';
import 'history_screen.dart';
import 'setting_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _loading = true;
  String _error = '';

  String _address = '';
  double _balanceJert = 0.0;

  double _energyMWh = 0.0;
  double _coldMWh = 0.0;

  double _usdPerMWh = 0.0;
  double _usdPerMWhCold = 0.0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      // 1) адрес и баланс из локального WalletService
      final addr = await WalletService.getAddress();
      final bal = await WalletService.getBalance();

      // 2) энергорейты и конвертация через API Gateway
      final rates = await ApiService.getEnergyRates();
      final converted = await ApiService.convertJert(bal);

      setState(() {
        _address = addr;
        _balanceJert = bal;

        _energyMWh = (converted['energyMWhEquivalent'] ?? 0).toDouble();
        _coldMWh = (converted['coldMWhEquivalent'] ?? 0).toDouble();

        _usdPerMWh = (rates['usdPerMWh'] ?? 0).toDouble();
        _usdPerMWhCold = (rates['usdPerMWhCold'] ?? 0).toDouble();

        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load wallet data: $e';
        _loading = false;
      });
    }
  }

  void _openSend() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SendScreen()),
    );
  }

  void _openReceive() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const ReceiveScreen()),
    );
  }

  void _openHistory() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const HistoryScreen()),
    );
  }

  void _openSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SettingScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF05060A),
      appBar: AppBar(
        title: const Text('JERT Wallet'),
        backgroundColor: const Color(0xFF0A0D14),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _openSettings,
          ),
        ],
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        _error,
                        style: const TextStyle(color: Colors.redAccent),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildAddressCard(),
                          const SizedBox(height: 16),
                          _buildBalanceCard(),
                          const SizedBox(height: 16),
                          _buildEnergyCard(),
                          const SizedBox(height: 24),
                          _buildUsdRatesCard(),
                          const SizedBox(height: 24),
                          _buildActionsRow(),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildAddressCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Address',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            _address,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Balance',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            '${_balanceJert.toStringAsFixed(4)} JERT',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEnergyCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(neon: true),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Energy Equivalent',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Energy (MWh)',
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _energyMWh.toStringAsFixed(2),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Cold-Energy (MWh-cold)',
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _coldMWh.toStringAsFixed(2),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Conversion rules: 100 JERT = 1 MWh, 1000 JERT = 1 MWh-cold.\n'
            'USD pricing is calculated off-chain by the JERT Energy Oracle.',
            style: TextStyle(
              color: Colors.white38,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsdRatesCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'USD Reference Rates',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 8),
          Text(
            'USD per MWh: $_usdPerMWh',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
          const SizedBox(height: 4),
          Text(
            'USD per MWh-cold: $_usdPerMWhCold',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildActionsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildActionButton(Icons.send_rounded, 'Send', _openSend),
        _buildActionButton(
            Icons.call_received_rounded, 'Receive', _openReceive),
        _buildActionButton(Icons.history_rounded, 'History', _openHistory),
      ],
    );
  }

  Widget _buildActionButton(
      IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFF39E6FF), Color(0xFF7BB5CF)],
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF39E6FF).withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.black87),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
      ],
    );
  }

  BoxDecoration _cardDecoration({bool neon = false}) {
    return BoxDecoration(
      color: const Color(0xFF0A0D14),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(
        color: neon
            ? const Color(0xFF39E6FF).withOpacity(0.6)
            : const Color(0xFF39E6FF).withOpacity(0.25),
      ),
    );
  }
}
