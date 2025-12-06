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
/// - All business logic linking JERT balances to MWh / MWh-cold or USD is handled OFF-CHAIN
///   via the JERT API Gateway and Energy Oracle.
/// - The contract emits events that can be used by off-chain systems for audit, reporting,
///   and regulatory oversight.
contract TreasuryMultisig {
    /*//////////////////////////////////////////////////////////////
                             EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when a new transaction is submitted.
    event Submission(uint256 indexed txId);

    /// @notice Emitted when a transaction receives a confirmation from an owner.
    event Confirmation(address indexed owner, uint256 indexed txId);

    /// @notice Emitted when a confirmation is revoked by an owner.
    event Revocation(address indexed owner, uint256 indexed txId);

    /// @notice Emitted when a transaction is executed.
    event Execution(uint256 indexed txId);

    /// @notice Emitted when a transaction execution fails.
    event ExecutionFailure(uint256 indexed txId);

    /// @notice Emitted on every ETH deposit into the contract.
    event Deposit(address indexed sender, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                             DATA STRUCTURES
    //////////////////////////////////////////////////////////////*/

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    /*//////////////////////////////////////////////////////////////
                               STORAGE
    //////////////////////////////////////////////////////////////*/

    address[] private _owners;
    mapping(address => bool) public isOwner;
    uint256 private _threshold;

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /// @dev Ensures that the caller is one of the owners.
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Multisig: caller not owner");
        _;
    }

    /// @dev Ensures that a transaction exists.
    modifier txExists(uint256 txId) {
        require(txId < transactionCount, "Multisig: tx does not exist");
        _;
    }

    /// @dev Ensures that a transaction has not been executed yet.
    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Multisig: tx already executed");
        _;
    }

    /// @dev Ensures that the caller has not yet confirmed the transaction.
    modifier notConfirmed(uint256 txId) {
        require(!confirmations[txId][msg.sender], "Multisig: already confirmed");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Deploys a new Treasury Multisig.
    /// @dev Owners and threshold are fixed at deployment time.
    /// @param owners_ Addresses of the initial multisig owners.
    /// @param threshold_ Number of confirmations required to execute a transaction.
    constructor(address[] memory owners_, uint256 threshold_) {
        require(owners_.length > 0, "Multisig: owners required");
        require(
            threshold_ > 0 && threshold_ <= owners_.length,
            "Multisig: invalid threshold"
        );

        for (uint256 i = 0; i < owners_.length; i++) {
            address owner = owners_[i];
            require(owner != address(0), "Multisig: owner zero");
            require(!isOwner[owner], "Multisig: owner not unique");

            isOwner[owner] = true;
            _owners.push(owner);
        }

        _threshold = threshold_;
    }

    /*//////////////////////////////////////////////////////////////
                              FALLBACKS
    //////////////////////////////////////////////////////////////*/

    /// @notice Accepts ETH deposits into the multisig treasury.
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /*//////////////////////////////////////////////////////////////
                               VIEWS
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns the array of owner addresses.
    /// @return ownersArray The list of owners.
    function getOwners() external view returns (address[] memory ownersArray) {
        ownersArray = _owners;
    }

    /// @notice Returns the number of confirmations required to execute a transaction.
    /// @return thresholdCount The threshold of required owner confirmations.
    function getThreshold() external view returns (uint256 thresholdCount) {
        thresholdCount = _threshold;
    }

    /// @notice Returns information about a specific transaction.
    /// @param txId Transaction identifier.
    /// @return destination Destination address of the transaction.
    /// @return value ETH value (in wei) to be sent with the transaction.
    /// @return data Calldata payload for the transaction.
    /// @return executed True if the transaction has already been executed.
    /// @return confirmationsCount Number of confirmations collected.
    function getTransaction(
        uint256 txId
    )
        external
        view
        txExists(txId)
        returns (
            address destination,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmationsCount
        )
    {
        Transaction storage txn = transactions[txId];
        return (
            txn.destination,
            txn.value,
            txn.data,
            txn.executed,
            txn.confirmations
        );
    }

    /*//////////////////////////////////////////////////////////////
                         TRANSACTION LIFECYCLE
    //////////////////////////////////////////////////////////////*/

    /// @notice Submits a new transaction to be approved and executed by the owners.
    /// @dev The transaction is automatically confirmed by the submitting owner.
    /// @param destination Destination address of the transaction.
    /// @param value ETH value (in wei) to send with the transaction (can be 0).
    /// @param data Calldata for the transaction (e.g. encoded ERC-20 transfer).
    /// @return txId Newly created transaction identifier.
    function submitTransaction(
        address destination,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256 txId) {
        require(destination != address(0), "Multisig: dest zero");

        txId = transactionCount;
        transactions[txId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        transactionCount++;

        emit Submission(txId);

        _confirmTransaction(txId);
    }

    /// @notice Confirms a transaction that has been previously submitted.
    /// @param txId Identifier of the transaction to confirm.
    function confirmTransaction(
        uint256 txId
    ) external onlyOwner txExists(txId) notExecuted(txId) notConfirmed(txId) {
        _confirmTransaction(txId);
    }

    /// @dev Internal confirmation logic shared by submitTransaction and confirmTransaction.
    ///      Executes the transaction automatically when threshold is reached.
    function _confirmTransaction(uint256 txId) internal {
        confirmations[txId][msg.sender] = true;
        transactions[txId].confirmations += 1;

        emit Confirmation(msg.sender, txId);

        if (transactions[txId].confirmations >= _threshold) {
            _executeTransaction(txId);
        }
    }

    /// @notice Revokes a previously given confirmation by the caller.
    /// @param txId Identifier of the transaction.
    function revokeConfirmation(
        uint256 txId
    )
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(
            confirmations[txId][msg.sender],
            "Multisig: not confirmed by caller"
        );

        confirmations[txId][msg.sender] = false;
        transactions[txId].confirmations -= 1;

        emit Revocation(msg.sender, txId);
    }

    /// @notice Executes a confirmed transaction (if the threshold is already met).
    /// @dev Can be called by any owner once the required confirmations have been collected.
    /// @param txId Identifier of the transaction to execute.
    function executeTransaction(
        uint256 txId
    ) external onlyOwner txExists(txId) notExecuted(txId) {
        require(
            transactions[txId].confirmations >= _threshold,
            "Multisig: not enough confirmations"
        );
        _executeTransaction(txId);
    }

    /// @dev Internal transaction execution logic.
    ///      Marks the transaction as executed before performing the external call to avoid
    ///      reentrancy on the same txId.
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
