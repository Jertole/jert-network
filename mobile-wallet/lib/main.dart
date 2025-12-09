import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:web3dart/web3dart.dart';

import 'services/wallet_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const JertWalletApp());
}

class JertWalletApp extends StatelessWidget {
  const JertWalletApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JERT Wallet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF020617),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF38bdf8),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const SplashScreen(),
    );
  }
}

/// SPLASH: проверяем кошелёк + PIN
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _walletService = WalletService();

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final hasWallet = await _walletService.hasWallet();
    if (!mounted) return;

    if (!hasWallet) {
      // нет кошелька → onboarding
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => OnboardingScreen(walletService: _walletService),
        ),
      );
      return;
    }

    // кошелёк есть → проверяем PIN
    final hasPin = await _walletService.hasPin();
    if (!mounted) return;

    if (hasPin) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => PinUnlockScreen(walletService: _walletService),
        ),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(walletService: _walletService),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}

/// PIN Unlock: двухфакторная защита входа
class PinUnlockScreen extends StatefulWidget {
  final WalletService walletService;
  const PinUnlockScreen({super.key, required this.walletService});

  @override
  State<PinUnlockScreen> createState() => _PinUnlockScreenState();
}

class _PinUnlockScreenState extends State<PinUnlockScreen> {
  final _pinController = TextEditingController();
  int _attemptsLeft = 5;
  bool _verifying = false;
  String? _error;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _verifyPin() async {
    setState(() {
      _verifying = true;
      _error = null;
    });

    final ok = await widget.walletService.verifyPin(_pinController.text);
    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(walletService: widget.walletService),
        ),
      );
    } else {
      setState(() {
        _attemptsLeft -= 1;
        _verifying = false;
        _error = _attemptsLeft > 0
            ? 'Wrong PIN. Attempts left: $_attemptsLeft'
            : 'Too many failed attempts. Restart the app.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final blocked = _attemptsLeft <= 0;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              const Text(
                "Unlock JERT Wallet",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                "Enter your PIN to access wallet.",
                style: TextStyle(color: Colors.grey[400], fontSize: 12),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _pinController,
                decoration: const InputDecoration(
                  labelText: "PIN",
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                keyboardType: TextInputType.number,
                enabled: !blocked,
              ),
              const SizedBox(height: 8),
              if (_error != null)
                Text(
                  _error!,
                  style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: blocked || _verifying ? null : _verifyPin,
                  child: _verifying
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("Unlock"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// ONBOARDING: создать / импортировать кошелёк + сразу установить PIN (опционально)
class OnboardingScreen extends StatefulWidget {
  final WalletService walletService;
  const OnboardingScreen({super.key, required this.walletService});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _creating = false;
  final _importController = TextEditingController();
  final _pinController = TextEditingController();

  @override
  void dispose() {
    _importController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _createWallet() async {
    setState(() => _creating = true);
    try {
      await widget.walletService.createWallet(pin: _pinController.text);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(walletService: widget.walletService),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  Future<void> _importWallet() async {
    setState(() => _creating = true);
    try {
      await widget.walletService.importWallet(
        _importController.text,
        pin: _pinController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(walletService: widget.walletService),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.redAccent),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              const Text(
                "JERT Wallet",
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                "Non-custodial wallet for JERT Permissioned EVM network.",
                style: TextStyle(color: Colors.grey[400], fontSize: 12),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _pinController,
                decoration: const InputDecoration(
                  labelText: "PIN (optional, used for 2FA)",
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _creating ? null : _createWallet,
                      child: _creating
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text("Create new wallet"),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              TextField(
                controller: _importController,
                decoration: const InputDecoration(
                  labelText: "Import private key (0x...)",
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _creating ? null : _importWallet,
                  child: const Text("Import existing wallet"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// HOME: баланс + навигация Send / Receive
class HomeScreen extends StatefulWidget {
  final WalletService walletService;
  const HomeScreen({super.key, required this.walletService});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  EthereumAddress? _address;
  String _ethBalance = '0.0';
  String _jertBalance = '0.0';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final addr = await widget.walletService.getAddress();
      if (addr == null) {
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => OnboardingScreen(walletService: widget.walletService),
          ),
        );
        return;
      }

      final eth = await widget.walletService.getEthBalance(addr);
      final jert = await widget.walletService.getJertBalance(addr);

      if (!mounted) return;
      setState(() {
        _address = addr;
        _ethBalance = eth.getValueInUnit(EtherUnit.ether).toStringAsFixed(4);
        _jertBalance =
            NumberFormat.compact().format(jert / BigInt.from(10).pow(18));
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load balance: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final addrShort = _address == null
        ? '...'
        : '${_address.toString().substring(0, 8)}…${_address.toString().substring(_address.toString().length - 4)}';

    return Scaffold(
      appBar: AppBar(
        title: const Text("JERT Wallet"),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: _loading
                    ? const Center(child: CircularProgressIndicator())
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "Address",
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            addrShort,
                            style: const TextStyle(
                              fontSize: 16,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            "Balance",
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "$_jertBalance JERT",
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "$_ethBalance ETH (for gas)",
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _address == null
                        ? null
                        : () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => ReceiveScreen(address: _address!),
                              ),
                            );
                          },
                    icon: const Icon(Icons.call_received),
                    label: const Text("Receive"),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _address == null
                        ? null
                        : () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => SendScreen(
                                  walletService: widget.walletService,
                                  from: _address!,
                                ),
                              ),
                            );
                          },
                    icon: const Icon(Icons.call_made),
                    label: const Text("Send"),
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

/// RECEIVE: QR-код адреса
class ReceiveScreen extends StatelessWidget {
  final EthereumAddress address;
  const ReceiveScreen({super.key, required this.address});

  @override
  Widget build(BuildContext context) {
    final addrStr = address.toString();
    return Scaffold(
      appBar: AppBar(
        title: const Text("Receive JERT"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              "Scan this QR to receive JERT or ETH on JERT network",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            QrImageView(
              data: addrStr,
              size: 220,
              backgroundColor: Colors.white,
            ),
            const SizedBox(height: 20),
            SelectableText(
              addrStr,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// SEND: форма отправки JERT с проверкой PIN (2FA)
class SendScreen extends StatefulWidget {
  final WalletService walletService;
  final EthereumAddress from;

  const SendScreen({
    super.key,
    required this.walletService,
    required this.from,
  });

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  final _toController = TextEditingController();
  final _amountController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _toController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<bool> _checkPin2FA() async {
    final hasPin = await widget.walletService.hasPin();
    if (!hasPin) {
      // PIN не установлен — пропускаем 2FA
      return true;
    }

    final controller = TextEditingController();
    bool success = false;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) {
        bool verifying = false;
        String? error;

        return StatefulBuilder(
          builder: (context, setState) {
            Future<void> verify() async {
              setState(() {
                verifying = true;
                error = null;
              });
              final ok = await widget.walletService.verifyPin(controller.text);
              if (!mounted) return;
              if (ok) {
                success = true;
                Navigator.of(context).pop();
              } else {
                setState(() {
                  verifying = false;
                  error = "Wrong PIN";
                });
              }
            }

            return AlertDialog(
              title: const Text("Confirm with PIN"),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "Enter your PIN to confirm this transaction.",
                    style: TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: controller,
                    obscureText: true,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: "PIN",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      error!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
              actions: [
                TextButton(
                  onPressed: verifying
                      ? null
                      : () {
                          Navigator.of(context).pop();
                        },
                  child: const Text("Cancel"),
                ),
                ElevatedButton(
                  onPressed: verifying ? null : verify,
                  child: verifying
                      ? const SizedBox(
                          height: 14,
                          width: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("Confirm"),
                ),
              ],
            );
          },
        );
      },
    );

    return success;
  }

  Future<void> _send() async {
    // сначала — 2FA PIN
    final allowed = await _checkPin2FA();
    if (!allowed) return;

    setState(() => _sending = true);
    try {
      final to = _toController.text.trim();
      final amountStr = _amountController.text.trim();

      if (!to.startsWith('0x') || to.length < 10) {
        throw const FormatException('Invalid destination address');
      }

      final value = double.tryParse(amountStr);
      if (value == null || value <= 0) {
        throw const FormatException('Invalid amount');
      }

      // amount в JERT с 18 знаками
      final amount = BigInt.from(value * 1e6) * BigInt.from(10).pow(12);

      final txHash = await widget.walletService.sendJert(
        to: to,
        amount: amount,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Transaction sent:\n$txHash')),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Send JERT"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _toController,
              decoration: const InputDecoration(
                labelText: "Recipient address (0x...)",
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: "Amount (JERT)",
                border: OutlineInputBorder(),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _sending ? null : _send,
                child: _sending
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text("Send"),
              ),
            )
          ],
        ),
      ),
    );
  }
}
