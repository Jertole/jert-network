
import 'package:flutter/material.dart';
import '../config/jert_network_config.dart';
import '../config/jert_token.dart';

class JertBalanceCard extends StatefulWidget {
  const JertBalanceCard({
    super.key,
    this.initialAddress,
  });

  final String? initialAddress;

  @override
  State<JertBalanceCard> createState() => _JertBalanceCardState();
}

class _JertBalanceCardState extends State<JertBalanceCard> {
  late TextEditingController _addressController;

  String _balance = '-';
  String _symbol = 'JERT';
  String? _error;
  bool _loading = false;

  final JertNetworkConfig _network = getDefaultJertNetwork();

  @override
  void initState() {
    super.initState();
    _addressController =
        TextEditingController(text: widget.initialAddress ?? '');
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _loadBalance() async {
    final addr = _addressController.text.trim();

    if (addr.isEmpty) {
      setState(() {
        _error = 'Enter wallet address';
      });
      return;
    }

    final tokenAddress = getJertTokenAddress(_network.key);
    if (tokenAddress == null) {
      setState(() {
        _error = 'JERT token address not set for current network';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // TODO: подключить web3dart и вызывать balanceOf(addr)
      // Сейчас просто ставим заглушку, чтобы UI работал.
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        _balance = '0.0'; // <- позже заменим реальным значением
        _symbol = 'JERT';
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load balance: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokenAddr = getJertTokenAddress(_network.key);

    return Card(
      color: const Color(0xFF05050A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'JERT Balance',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Network: ${_network.label} (chainId ${_network.chainId})',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 12,
              ),
            ),
            if (tokenAddr == null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Set JERT token address in jert_token.dart',
                  style: TextStyle(
                    color: Colors.redAccent.shade200,
                    fontSize: 12,
                  ),
                ),
              ),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              style: const TextStyle(
                color: Colors.white,
                fontFamily: 'monospace',
                fontSize: 13,
              ),
              decoration: InputDecoration(
                labelText: 'Wallet address',
                labelStyle: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 12,
                ),
                hintText: '0x...',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(0.4),
                  fontSize: 12,
                ),
                filled: true,
                fillColor: const Color(0xFF0B0B12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF222222)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF222222)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF00E5FF)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading || tokenAddr == null ? null : _loadBalance,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                  elevation: 0,
                ).copyWith(
                  backgroundColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.disabled)) {
                      return Colors.grey.shade800;
                    }
                    return const LinearGradient(
                      colors: [
                        Color(0xFF00E5FF),
                        Color(0xFF00FF9D),
                        Color(0xFFB000FF),
                      ],
                    ).createShader(const Rect.fromLTWH(0, 0, 200, 48))
                        as Color;
                  }),
                ),
                child: Text(
                  _loading ? 'Loading...' : 'Refresh balance',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF060612),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF333333)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Current balance',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _balance,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _symbol,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  _error!,
                  style: TextStyle(
                    color: Colors.redAccent.shade200,
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
