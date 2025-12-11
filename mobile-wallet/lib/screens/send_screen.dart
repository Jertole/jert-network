
import 'package:flutter/material.dart';

import '../services/wallet_service.dart';

class SendScreen extends StatefulWidget {
  final String fromAddress;
  final WalletService walletService;

  const SendScreen({
    super.key,
    required this.fromAddress,
    required this.walletService,
  });

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  final _formKey = GlobalKey<FormState>();
  final _toController = TextEditingController();
  final _amountController = TextEditingController();

  bool _isSending = false;
  String? _lastTxHash;
  String? _errorText;

  @override
  void dispose() {
    _toController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _onSendPressed() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSending = true;
      _errorText = null;
      _lastTxHash = null;
    });

    try {
      final to = _toController.text.trim();
      final amountText = _amountController.text.trim().replaceAll(',', '.');

      final amount = double.tryParse(amountText);
      if (amount == null || amount <= 0) {
        setState(() {
          _errorText = 'Invalid amount';
          _isSending = false;
        });
        return;
      }

      // Перевод JERT → wei (1e18)
      final BigInt amountWei = BigInt.from((amount * 1e18).round());

      final txHash = await widget.walletService.sendJert(
        fromAddress: widget.fromAddress,
        toAddress: to,
        amountWei: amountWei,
      );

      setState(() {
        _lastTxHash = txHash;
        _isSending = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transaction sent successfully')),
      );
    } catch (e) {
      setState(() {
        _errorText = e.toString();
        _isSending = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Send JERT'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Отправитель
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'From:',
                style: theme.textTheme.labelMedium,
              ),
            ),
            const SizedBox(height: 4),
            SelectableText(
              widget.fromAddress,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 20),

            Form(
              key: _formKey,
              child: Column(
                children: [
                  // Адрес получателя
                  TextFormField(
                    controller: _toController,
                    decoration: const InputDecoration(
                      labelText: "To address (0x...)",
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      final v = value?.trim() ?? '';
                      if (v.isEmpty) return 'Enter destination address';
                      if (!v.startsWith("0x") || v.length < 10) {
                        return 'Invalid Ethereum address';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Сумма
                  TextFormField(
                    controller: _amountController,
                    decoration: const InputDecoration(
                      labelText: "Amount (JERT)",
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: (value) {
                      final v = value?.trim() ?? '';
                      if (v.isEmpty) return "Enter amount";
                      final n = double.tryParse(v.replaceAll(",", "."));
                      if (n == null || n <= 0) return "Invalid amount";
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // Кнопка отправки
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSending ? null : _onSendPressed,
                      child: _isSending
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text("Send"),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Ошибка
            if (_errorText != null) ...[
              Text(
                _errorText!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Хеш последней транзакции
            if (_lastTxHash != null) ...[
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Last tx hash:",
                  style: theme.textTheme.labelMedium,
                ),
              ),
              const SizedBox(height: 4),
              SelectableText(
                _lastTxHash!,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
