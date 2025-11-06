// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct TicketInfo {
        uint256 projectId;
        uint256 optionIndex;
        uint256 purchasePrice;
        uint256 purchaseTime;
    }

    mapping(uint256 => TicketInfo) public ticketInfo;
    mapping(uint256 => uint256[]) public projectTickets;
    mapping(address => uint256[]) public ownerTickets;

    event TicketMinted(uint256 indexed tokenId, address owner, uint256 projectId, uint256 optionIndex);
    event TicketTransferred(uint256 indexed tokenId, address from, address to);

    constructor() ERC721("EasyBet Ticket", "EBT") {
        // 在 v4.x 中会自动设置部署者为所有者
    }

    function mintTicket(
        address to,
        uint256 projectId,
        uint256 optionIndex,
        uint256 purchasePrice
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);

        ticketInfo[tokenId] = TicketInfo({
            projectId: projectId,
            optionIndex: optionIndex,
            purchasePrice: purchasePrice,
            purchaseTime: block.timestamp
        });

        projectTickets[projectId].push(tokenId);
        ownerTickets[to].push(tokenId);

        emit TicketMinted(tokenId, to, projectId, optionIndex);
        return tokenId;
    }

    function getTicketInfo(uint256 tokenId) external view returns (
        uint256 projectId,
        uint256 optionIndex,
        uint256 purchasePrice,
        uint256 purchaseTime
    ) {
        require(_exists(tokenId), "Ticket does not exist");
        TicketInfo storage ticket = ticketInfo[tokenId];
        return (
            ticket.projectId,
            ticket.optionIndex,
            ticket.purchasePrice,
            ticket.purchaseTime
        );
    }

    function getTicketsByProject(uint256 projectId) external view returns (uint256[] memory) {
        return projectTickets[projectId];
    }

    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTickets[owner];
    }

    // 重写 transfer 相关函数来跟踪所有权变化
    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        _updateOwnerTickets(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        super.safeTransferFrom(from, to, tokenId);
        _updateOwnerTickets(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override {
        super.safeTransferFrom(from, to, tokenId, _data);
        _updateOwnerTickets(from, to, tokenId);
    }

    function _updateOwnerTickets(address from, address to, uint256 tokenId) private {
        // 从原所有者列表中移除
        if (from != address(0)) {
            _removeFromOwnerTickets(from, tokenId);
        }
        
        // 添加到新所有者列表
        if (to != address(0)) {
            ownerTickets[to].push(tokenId);
        }
        
        emit TicketTransferred(tokenId, from, to);
    }

    function _removeFromOwnerTickets(address from, uint256 tokenId) private {
        uint256[] storage tickets = ownerTickets[from];
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i] == tokenId) {
                tickets[i] = tickets[tickets.length - 1];
                tickets.pop();
                break;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        TicketInfo storage ticket = ticketInfo[tokenId];
        return string(abi.encodePacked(
            "https://api.easybet.com/tickets/",
            _toString(tokenId),
            "?project=",
            _toString(ticket.projectId),
            "&option=",
            _toString(ticket.optionIndex)
        ));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}