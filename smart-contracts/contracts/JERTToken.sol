// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERTToken
/// @notice ERC20-токен с максимальной эмиссией и минтом только для владельца
contract JERTToken is ERC20, Ownable {
    /// @notice Максимальное количество токенов (с учётом decimals = 18)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether; // 1 млрд JERT

    constructor(address treasury) ERC20("JERT Token", "JERT") {
        // Минтим всю эмиссию на адрес казначейства
        _mint(treasury, MAX_SUPPLY);

        // Делаем treasury владельцем контракта
        _transferOwnership(treasury);
    }

    /// @notice Минт доступен только владельцу и не может превышать MAX_SUPPLY
    function mint(address to, uint256 amount) external onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "JERT: MAX_SUPPLY exceeded"
        );
        _mint(to, amount);
    }

    /// @notice Владелец может сжигать свои токены
    function burn(uint256 amount) external onlyOwner {
        _burn(_msgSender(), amount);
    }
}
