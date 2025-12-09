// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title KYC Registry
/// @notice Регистр KYC-статуса адресов для экосистемы JERT.
contract KYCRegistry is Ownable {
    /// @dev хранит, разрешён ли адрес.
    mapping(address => bool) private _allowed;

    event KYCStatusUpdated(address indexed account, bool isAllowed);

    constructor() Ownable(msg.sender) {}

    /// @notice Установить KYC-статус для аккаунта.
    /// @dev только владелец реестра (обычно админ/комплаенс).
    function setKYCStatus(address account, bool isAllowed_) external onlyOwner {
        _allowed[account] = isAllowed_;
        emit KYCStatusUpdated(account, isAllowed_);
    }

    /// @notice Проверить, разрешён ли адрес.
    /// ВАЖНО: в контракте не должно быть дубликата этой функции.
    function isAllowed(address account) external view returns (bool) {
        return _allowed[account];
    }
}
