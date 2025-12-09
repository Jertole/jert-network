// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT Utility Token
/// @notice Базовый ERC20-токен для экосистемы JERT.
/// @dev Собственник (owner) получает весь initialSupply и может минтить/жечь токены.
contract JERTToken is ERC20, Ownable {
    /// @notice Конструктор без аргументов для удобства деплоя из скриптов.
    /// Имя и символ зашиты в контракт, владелец = msg.sender.
    constructor() ERC20("JERT Token", "JERT") Ownable(msg.sender) {
        // При желании можно изменить initial supply
        uint256 initialSupply = 1_000_000_000 * 10 ** decimals(); // 1e9 JERT
        _mint(msg.sender, initialSupply);
    }

    /// @notice Минт дополнительных токенов на указанный адрес.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Сжигание токенов с собственного баланса.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
