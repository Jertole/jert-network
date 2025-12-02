// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TreasuryMultisig
/// @notice Simple multisig wallet for JERT treasury (ETH/contract calls), with N owners and M-of-N threshold.
contract TreasuryMultisig {
    // --- Owners and threshold ---

    address[] private _owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold; // required confirmations

    // --- Transactions ---

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvedBy;

    // --- Events ---

    event Submit(uint256 indexed txId, address indexed owner, address indexed to, uint256 value, bytes data);
    event Confirm(uint256 indexed txId, address indexed owner);
    event Revoke(uint256 indexed txId, address indexed owner);
    event Execute(uint256 indexed txId, address indexed executor, bool success, bytes result);
    event Deposit(address indexed from, uint256 amount);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint256 txId) {
        require(!approvedBy[txId][msg.sender], "Tx already confirmed by this owner");
        _;
    }

    // --- Constructor ---

    constructor(address[] memory owners, uint256 _threshold) {
        require(owners.length >= 3, "Need at least 3 owners");
        require(_threshold > 0 && _threshold <= owners.length, "Invalid threshold");

        for (uint256 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            require(owner != address(0), "Owner is zero address");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            _owners.push(owner);
        }

        threshold = _threshold;
    }

    // --- View helpers ---

    function getOwners() external view returns (address[] memory) {
        return _owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    // --- Core multisig logic ---

    /// @notice Submit new transaction proposal.
    function submitTransaction(address to, uint256 value, bytes calldata data)
        external
        onlyOwner
        returns (uint256 txId)
    {
        txId = transactions.length;

        transactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                confirmations: 0
            })
        );

        emit Submit(txId, msg.sender, to, value, data);
    }

    /// @notice Confirm previously submitted transaction and auto-execute if threshold reached.
    function confirmTransaction(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        notConfirmed(txId)
    {
        approvedBy[txId][msg.sender] = true;
        transactions[txId].confirmations += 1;

        emit Confirm(txId, msg.sender);

        if (transactions[txId].confirmations >= threshold) {
            _executeTransaction(txId);
        }
    }

    /// @notice Revoke confirmation for a pending transaction.
    function revokeConfirmation(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(approvedBy[txId][msg.sender], "Tx not confirmed by this owner");

        approvedBy[txId][msg.sender] = false;
        transactions[txId].confirmations -= 1;

        emit Revoke(txId, msg.sender);
    }

    /// @notice Execute transaction if threshold already satisfied (manual trigger).
    function executeTransaction(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(transactions[txId].confirmations >= threshold, "Not enough confirmations");
        _executeTransaction(txId);
    }

    function _executeTransaction(uint256 txId) internal {
        Transaction storage txn = transactions[txId];
        require(!txn.executed, "Tx already executed");

        txn.executed = true;

        (bool success, bytes memory result) = txn.to.call{value: txn.value}(txn.data);
        emit Execute(txId, msg.sender, success, result);

        require(success, "Tx execution failed");
    }

    // --- Receive ETH ---

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
