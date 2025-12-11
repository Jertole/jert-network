class TxItem {
  final String hash;
  final String from;
  final String to;
  final BigInt value;
  final DateTime timestamp;

  TxItem({
    required this.hash,
    required this.from,
    required this.to,
    required this.value,
    required this.timestamp,
  });
}
