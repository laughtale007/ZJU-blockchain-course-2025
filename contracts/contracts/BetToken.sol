// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BetToken is ERC20, Ownable {
    mapping(address => bool) public hasClaimed;
    
    event TokensClaimed(address indexed user, uint256 amount);

    constructor() ERC20("EasyBet Token", "EBET") {
       
    }

    function claimTokens() external {
        require(!hasClaimed[msg.sender], "User has already claimed tokens");
        hasClaimed[msg.sender] = true;
        
        uint256 amount = 100 * 10 ** decimals();
        _mint(msg.sender, amount);
        
        emit TokensClaimed(msg.sender, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}