
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
  String address = "";
  double balanceJert = 0.0;

  double energyMWh = 0.0;
  double coldMWh = 0.0;

  double usdPerMWh = 0.0;
  double usdPerMWhCold = 0.0;

  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadWallet();
  }

  Future<void> _loadWallet() async {
    final addr = await WalletService.getAddress();
    final bal = await WalletService.getBalance();

    final rates = await ApiService.getEnergyRates();
    final converted = await ApiService.convertJert(bal);

    setState(() {
      address = addr;
      balanceJert = bal;

      energyMWh = converted["energyMWhEquivalent"];
      coldMWh = converted["coldMWhEquivalent"];

      usdPerMWh = rates["usdPerMWh"];
      usdPerMWhCold = rates["usdPerMWhCold"];

      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("JERT Wallet"),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SettingScreen()),
            ),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Wallet Address:", style: TextStyle(color: Colors.grey)),
            Text(address, style: const TextStyle(fontSize: 14)),

            const SizedBox(height: 20),

            Text("Balance: $balanceJert JERT",
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),

            const SizedBox(height: 20),

            // ENERGY SECTION
            const Text("Energy Equivalent", style: TextStyle(fontSize: 16)),
            Text("$energyMWh MWh", style: const TextStyle(fontSize: 14)),
            const SizedBox(height: 8),
            Text("$coldMWh MWh-cold", style: const TextStyle(fontSize: 14)),

            const SizedBox(height: 20),

            // USD RATES
            const Text("USD Reference Rates", style: TextStyle(fontSize: 16)),
            Text("USD/MWh: $usdPerMWh"),
            Text("USD/MWh-cold: $usdPerMWhCold"),

            const Spacer(),

            // ACTION BUTTONS
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  icon: const Icon(Icons.send),
                  label: const Text("Send"),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SendScreen()),
                  ),
                ),
                ElevatedButton.icon(
                  icon: const Icon(Icons.download),
                  label: const Text("Receive"),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ReceiveScreen()),
                  ),
                ),
                ElevatedButton.icon(
                  icon: const Icon(Icons.history),
                  label: const Text("History"),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const HistoryScreen()),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
