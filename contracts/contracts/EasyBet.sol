// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EasyBet is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _projectCounter;
    Counters.Counter private _orderCounter;

    enum ProjectStatus { Active, Settled, Cancelled }

    struct Project {
        uint256 id;
        string title;
        string description;
        string[] options;
        uint256 ticketPrice;
        uint256 totalPrize;
        uint256 maxTickets;
        uint256 soldTickets;
        uint256 endTime;
        address creator;
        ProjectStatus status;
        uint256 winningOption;
    }

    struct Order {
        uint256 id;
        uint256 ticketId;
        uint256 projectId;
        address seller;
        uint256 price;
        uint256 createTime;
        bool active;
    }

    // Events
    event ProjectCreated(uint256 indexed projectId, address creator, string title, uint256 prize);
    event TicketPurchased(uint256 indexed ticketId, uint256 projectId, address buyer, uint256 option);
    event OrderCreated(uint256 indexed orderId, uint256 ticketId, address seller, uint256 price);
    event OrderFilled(uint256 indexed orderId, address seller, address buyer, uint256 price);
    event OrderCancelled(uint256 indexed orderId);
    event ProjectSettled(uint256 indexed projectId, uint256 winningOption);
    event PrizeDistributed(uint256 indexed projectId, address winner, uint256 amount);

    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => uint256[]) public projectOrders;
    mapping(address => uint256[]) public userOrders;
    mapping(uint256 => uint256) public ticketToOrder;

    // Contract addresses
    address public betToken;
    address public ticketNFT;

    constructor(address _betToken, address _ticketNFT) {
        betToken = _betToken;
        ticketNFT = _ticketNFT;
    }

    function createProject(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration
    ) external returns (uint256) {
        require(_options.length >= 2, "At least two options are required");
        require(_ticketPrice > 0, "Ticket price must be greater than zero");
        require(_maxTickets > 0, "Max tickets must be positive");
        require(_duration > 0, "Duration must be greater than zero");

        _projectCounter.increment();
        uint256 projectId = _projectCounter.current();

        uint256 totalPrize = _ticketPrice * _maxTickets;
        
        require(
            IERC20(betToken).transferFrom(msg.sender, address(this), totalPrize),
            "Transfer of prize tokens failed"
        );

        projects[projectId] = Project({
            id: projectId,
            title: _title,
            description: _description,
            options: _options,
            ticketPrice: _ticketPrice,
            totalPrize: totalPrize,
            maxTickets: _maxTickets,
            soldTickets: 0,
            endTime: block.timestamp + _duration,
            creator: msg.sender,
            status: ProjectStatus.Active,
            winningOption: 0
        });

        emit ProjectCreated(projectId, msg.sender, _title, totalPrize);
        return projectId;
    }

    function purchaseTicket(uint256 _projectId, uint256 _optionIndex) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Invalid project ID");
        require(project.status == ProjectStatus.Active, "Project is not active");
        require(block.timestamp < project.endTime, "Project has ended");
        require(_optionIndex < project.options.length, "Invalid option index");
        require(project.soldTickets < project.maxTickets, "Project is sold out");

        require(
            IERC20(betToken).transferFrom(msg.sender, address(this), project.ticketPrice),
            "Transfer of ticket price failed"
        );

        uint256 ticketId = ITicketNFT(ticketNFT).mintTicket(
            msg.sender,
            _projectId,
            _optionIndex,
            project.ticketPrice
        );

        project.soldTickets++;
        project.totalPrize += project.ticketPrice;

        emit TicketPurchased(ticketId, _projectId, msg.sender, _optionIndex);
        return ticketId;
    }

    function listTicket(uint256 _ticketId, uint256 _price) external nonReentrant {
        require(ITicketNFT(ticketNFT).ownerOf(_ticketId) == msg.sender, "Not ticket owner");
        require(_price > 0, "Price must be greater than zero");
        require(ticketToOrder[_ticketId] == 0, "Ticket already listed");

        (uint256 projectId, uint256 optionIndex,,) = ITicketNFT(ticketNFT).getTicketInfo(_ticketId);
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Active, "Project is not active");

        _orderCounter.increment();
        uint256 orderId = _orderCounter.current();

        orders[orderId] = Order({
            id: orderId,
            ticketId: _ticketId,
            projectId: projectId,
            seller: msg.sender,
            price: _price,
            createTime: block.timestamp,
            active: true
        });

        projectOrders[projectId].push(orderId);
        userOrders[msg.sender].push(orderId);
        ticketToOrder[_ticketId] = orderId;

        emit OrderCreated(orderId, _ticketId, msg.sender, _price);
    }

    function buyListedTicket(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.id != 0, "Invalid order ID");
        require(order.active, "Order is not active");
        require(order.seller != msg.sender, "Cannot buy your own ticket");

        require(
            ITicketNFT(ticketNFT).ownerOf(order.ticketId) == order.seller,
            "Seller no longer owns the ticket"
        );

        require(
            IERC20(betToken).transferFrom(msg.sender, order.seller, order.price),
            "Payment transfer failed"
        );

        ITicketNFT(ticketNFT).transferFrom(order.seller, msg.sender, order.ticketId);

        order.active = false;
        delete ticketToOrder[order.ticketId];

        emit OrderFilled(_orderId, order.seller, msg.sender, order.price);
    }

    function cancelOrder(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.id != 0, "Invalid order ID");
        require(order.active, "Order is not active");
        require(order.seller == msg.sender, "Not order seller");

        order.active = false;
        delete ticketToOrder[order.ticketId];

        emit OrderCancelled(_orderId);
    }

    function settleProject(uint256 _projectId, uint256 _winningOption) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Invalid project ID");
        require(project.status == ProjectStatus.Active, "Project is not active");
        require(block.timestamp >= project.endTime, "Project has not ended");
        require(_winningOption < project.options.length, "Invalid winning option");

        project.status = ProjectStatus.Settled;
        project.winningOption = _winningOption;

        uint256[] memory ticketIds = ITicketNFT(ticketNFT).getTicketsByProject(_projectId);
        
        uint256 winningTicketsCount = 0;
        for (uint256 i = 0; i < ticketIds.length; i++) {
            (, uint256 optionIndex,,) = ITicketNFT(ticketNFT).getTicketInfo(ticketIds[i]);
            if (optionIndex == _winningOption) {
                winningTicketsCount++;
            }
        }

        if (winningTicketsCount > 0) {
            uint256 prizePerTicket = project.totalPrize / winningTicketsCount;
            
            for (uint256 i = 0; i < ticketIds.length; i++) {
                (, uint256 optionIndex,,) = ITicketNFT(ticketNFT).getTicketInfo(ticketIds[i]);
                if (optionIndex == _winningOption) {
                    address winner = ITicketNFT(ticketNFT).ownerOf(ticketIds[i]);
                    require(
                        IERC20(betToken).transfer(winner, prizePerTicket),
                        "Prize transfer failed"
                    );
                    emit PrizeDistributed(_projectId, winner, prizePerTicket);
                }
            }
        }

        emit ProjectSettled(_projectId, _winningOption);
    }

    function getProject(uint256 _projectId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string[] memory options,
        uint256 endTime,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 totalPrize,
        uint256 soldTickets,
        address creator,
        ProjectStatus status,
        uint256 winningOption
    ) {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Invalid project ID");
        return (
            project.id,
            project.title,
            project.description,
            project.options,
            project.endTime,
            project.ticketPrice,
            project.maxTickets,
            project.totalPrize,
            project.soldTickets,
            project.creator,
            project.status,
            project.winningOption
        );
    }

    function getProjectOrderBook(uint256 _projectId) external view returns (uint256[] memory) {
        return projectOrders[_projectId];
    }

    function getOrder(uint256 _orderId) external view returns (
        uint256 ticketId,
        uint256 projectId,
        address seller,
        uint256 price,
        uint256 createTime,
        bool active
    ) {
        Order storage order = orders[_orderId];
        require(order.id != 0, "Invalid order ID");
        return (
            order.ticketId,
            order.projectId,
            order.seller,
            order.price,
            order.createTime,
            order.active
        );
    }

    function getProjectTicketStats(uint256 _projectId) external view returns (uint256[] memory) {
        Project storage project = projects[_projectId];
        require(project.id != 0, "Invalid project ID");
        
        uint256[] memory stats = new uint256[](project.options.length);
        uint256[] memory ticketIds = ITicketNFT(ticketNFT).getTicketsByProject(_projectId);
        
        for (uint256 i = 0; i < ticketIds.length; i++) {
            (, uint256 optionIndex,,) = ITicketNFT(ticketNFT).getTicketInfo(ticketIds[i]);
            stats[optionIndex]++;
        }
        
        return stats;
    }

    function getActiveProjects() external view returns (uint256[] memory) {
        uint256 projectCount = _projectCounter.current();
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= projectCount; i++) {
            if (projects[i].status == ProjectStatus.Active) {
                activeCount++;
            }
        }
        
        uint256[] memory activeProjects = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= projectCount; i++) {
            if (projects[i].status == ProjectStatus.Active) {
                activeProjects[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeProjects;
    }
}

interface ITicketNFT {
    function mintTicket(address to, uint256 projectId, uint256 optionIndex, uint256 purchasePrice) external returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getTicketInfo(uint256 tokenId) external view returns (uint256 projectId, uint256 optionIndex, uint256 purchasePrice, uint256 purchaseTime);
    function getTicketsByProject(uint256 projectId) external view returns (uint256[] memory);
    function getTicketsByOwner(address owner) external view returns (uint256[] memory);
}
