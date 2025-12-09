
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title JERT Treasury Multisig
/// @notice 3-of-N multisignature treasury contract used to control JERT funds dedicated
///         to Cryogas / JERT infrastructure, terminals and energy projects.
/// @dev
/// - This contract is intended to be controlled by core entities such as:
///   (1) Cryogas Kazakhstan LLP
///   (2) Vitlax Nordic AB (Sweden)
///   (3) SY Power Energy (Switzerland)
///   plus any additional governance signers if needed.
/// - The contract does NOT implement any USD pricing, energy accounting or cold-energy logic.
///   It only holds and routes JERT balances and other assets.
/// - Threshold configuration (e.g. 3-of-3) MUST be governed by off-chain corporate resolutions.
contract TreasuryMultisig {
    /// @notice Emitted when a deposit is received.
    event Deposit(address indexed sender, uint256 value);

    /// @notice Emitted when a transaction is submitted.
    event Submission(uint256 indexed txId);

    /// @notice Emitted when a confirmation is made by an owner.
    event Confirmation(address indexed owner, uint256 indexed txId);

    /// @notice Emitted when a confirmation is revoked.
    event Revocation(address indexed owner, uint256 indexed txId);

    /// @notice Emitted when a transaction is executed successfully.
    event Execution(uint256 indexed txId);

    /// @notice Emitted when a transaction execution fails.
    event ExecutionFailure(uint256 indexed txId);

    /// @notice Emitted when the owner set changes.
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint256 required);

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public isOwner;
    address[] public owners;
    uint256 public required;
    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Multisig: not owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "Multisig: tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Multisig: tx already executed");
        _;
    }

    modifier notConfirmed(uint256 txId) {
        require(!confirmations[txId][msg.sender], "Multisig: already confirmed");
        _;
    }

    /// @notice Multisig constructor.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations for a transaction.
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Multisig: owners required");
        require(
            _required > 0 && _required <= _owners.length,
            "Multisig: invalid required"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Multisig: zero owner");
            require(!isOwner[owner], "Multisig: owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
            emit OwnerAddition(owner);
        }

        required = _required;
        emit RequirementChange(required);
    }

    /// @notice Fallback receive function to accept ETH.
    /// @dev Emits a Deposit event.
    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    /// @notice Returns the number of owners.
    function getOwnersCount() external view returns (uint256) {
        return owners.length;
    }

    /// @notice Submits and confirms a new transaction in a single call.
    /// @param destination Recipient address.
    /// @param value ETH value to send.
    /// @param data Calldata to pass to the destination.
    function submitTransaction(
        address destination,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256 txId) {
        txId = _addTransaction(destination, value, data);
        emit Submission(txId);
        _confirmTransaction(txId);
    }

    /// @notice Confirms an existing transaction.
    /// @param txId Transaction identifier.
    function confirmTransaction(
        uint256 txId
    ) external onlyOwner txExists(txId) notExecuted(txId) notConfirmed(txId) {
        _confirmTransaction(txId);
    }

    /// @notice Revokes a previous confirmation.
    /// @param txId Transaction identifier.
    function revokeConfirmation(
        uint256 txId
    ) external onlyOwner txExists(txId) notExecuted(txId) {
        require(confirmations[txId][msg.sender], "Multisig: not confirmed");
        confirmations[txId][msg.sender] = false;

        Transaction storage txn = transactions[txId];
        txn.confirmations -= 1;

        emit Revocation(msg.sender, txId);
    }

    /// @notice Executes a confirmed transaction.
    /// @param txId Transaction identifier.
    function executeTransaction(
        uint256 txId
    ) external onlyOwner txExists(txId) notExecuted(txId) {
        Transaction storage txn = transactions[txId];

        require(
            txn.confirmations >= required,
            "Multisig: not enough confirmations"
        );

        _executeTransaction(txId);
    }

    /// @dev Internal helper to add a new transaction.
    function _addTransaction(
        address destination,
        uint256 value,
        bytes calldata data
    ) internal returns (uint256 txId) {
        require(destination != address(0), "Multisig: zero destination");

        txId = transactions.length;

        transactions.push(
            Transaction({
                destination: destination,
                value: value,
                data: data,
                executed: false,
                confirmations: 0
            })
        );
    }

    /// @dev Internal helper to confirm and possibly execute a transaction.
    function _confirmTransaction(uint256 txId) internal {
        Transaction storage txn = transactions[txId];

        require(!confirmations[txId][msg.sender], "Multisig: already confirmed");

        confirmations[txId][msg.sender] = true;
        txn.confirmations += 1;

        emit Confirmation(msg.sender, txId);

        if (txn.confirmations >= required && !txn.executed) {
            _executeTransaction(txId);
        }
    }

    /// @dev Internal helper to execute a transaction.
    function _executeTransaction(uint256 txId) internal {
        Transaction storage txn = transactions[txId];

        txn.executed = true;

        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        if (success) {
            emit Execution(txId);
        } else {
            emit ExecutionFailure(txId);
            txn.executed = false;
        }
    }
}
