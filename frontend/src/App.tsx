import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import './App.css';
import { 
  Project, 
  Ticket, 
  Order, 
  ProjectData, 
  OrderData, 
  TicketInfo,
  Web3CallResult 
} from './types/contracts';

// 合约 ABI 定义（保持不变）
const BET_TOKEN_ABI: AbiItem[] = [
  {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasClaimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

const TICKET_NFT_ABI: AbiItem[] = [
  {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "optionIndex",
          "type": "uint256"
        }
      ],
      "name": "TicketMinted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "TicketTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getTicketInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "optionIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "purchasePrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "purchaseTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getTicketsByOwner",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        }
      ],
      "name": "getTicketsByProject",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "optionIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "purchasePrice",
          "type": "uint256"
        }
      ],
      "name": "mintTicket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ownerTickets",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projectTickets",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ticketInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "optionIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "purchasePrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "purchaseTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

const EASY_BET_ABI: AbiItem[] = [
  {
      "inputs": [
        {
          "internalType": "address",
          "name": "_betToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_ticketNFT",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "orderId",
          "type": "uint256"
        }
      ],
      "name": "OrderCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "orderId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "ticketId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "OrderCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "orderId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "OrderFilled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PrizeDistributed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "prize",
          "type": "uint256"
        }
      ],
      "name": "ProjectCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "winningOption",
          "type": "uint256"
        }
      ],
      "name": "ProjectSettled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "ticketId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "option",
          "type": "uint256"
        }
      ],
      "name": "TicketPurchased",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "betToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_orderId",
          "type": "uint256"
        }
      ],
      "name": "buyListedTicket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_orderId",
          "type": "uint256"
        }
      ],
      "name": "cancelOrder",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_options",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "_ticketPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxTickets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_duration",
          "type": "uint256"
        }
      ],
      "name": "createProject",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveProjects",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_orderId",
          "type": "uint256"
        }
      ],
      "name": "getOrder",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "ticketId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "createTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProject",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "options",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "ticketPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxTickets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPrize",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "soldTickets",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "enum EasyBet.ProjectStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "winningOption",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProjectOrderBook",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProjectTicketStats",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_ticketId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "listTicket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "orders",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "ticketId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "createTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projectOrders",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projects",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "ticketPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPrize",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxTickets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "soldTickets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "enum EasyBet.ProjectStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "winningOption",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_optionIndex",
          "type": "uint256"
        }
      ],
      "name": "purchaseTicket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_winningOption",
          "type": "uint256"
        }
      ],
      "name": "settleProject",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ticketNFT",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ticketToOrder",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userOrders",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],      
        
      "stateMutability": "view",
      "type": "function"
    }
];

// 合约地址（部署后更新）
const CONTRACT_ADDRESSES = {
  betToken: '0x1aced234D575D4B0E247bA6aeF2063bD68a24889', // 部署后替换
  ticketNFT: '0xc2EacdCB2594DD6bdc278aa78b088134E22dAe0A', // 部署后替换
  easyBet: '0x76539Cea27b1137ba74Be2f67e0959799765016b'   // 部署后替换
};

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [recentProjectIds, setRecentProjectIds] = useState<number[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // 交易错误处理函数
  const handleTransactionError = (error: any): string => {
    console.error('交易错误详情:', error);
    
    if (error.code === 4001) {
      return '用户拒绝了交易';
    }
    
    if (error.code === -32603) {
      return '内部 JSON-RPC 错误 - 请检查合约部署和参数';
    }
    
    if (error.message) {
      if (error.message.includes('user rejected transaction')) {
        return '用户拒绝了交易';
      }
      if (error.message.includes('insufficient funds')) {
        return '余额不足，请确保有足够的 ETH 支付 Gas 费';
      }
      if (error.message.includes('execution reverted')) {
        const revertMatch = error.message.match(/execution reverted: ([^"]*)/);
        return revertMatch ? `合约执行失败: ${revertMatch[1]}` : '合约执行失败';
      }
    }
    
    return `交易失败: ${error.message || '未知错误'}`;
  };

  // 初始化 Web3
  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          await updateBalance(web3Instance, accounts[0]);
          await loadMyTickets(web3Instance, accounts[0]);
        }
        
        showStatus('钱包连接成功!', 'success');
      } catch (error) {
        console.error('连接钱包失败:', error);
        showStatus('连接钱包失败', 'error');
      }
    } else {
      showStatus('请安装 MetaMask!', 'error');
    }
  };

  // 更新余额
  const updateBalance = async (web3Instance: Web3, accountAddress: string) => {
    if (!CONTRACT_ADDRESSES.betToken) return;
    
    try {
      const betToken = new web3Instance.eth.Contract(BET_TOKEN_ABI, CONTRACT_ADDRESSES.betToken);
      const balanceResult: Web3CallResult<string> = await betToken.methods.balanceOf(accountAddress).call();
      
      const balanceStr = typeof balanceResult === 'string' ? balanceResult : String(balanceResult);
      setBalance(web3Instance.utils.fromWei(balanceStr, 'ether'));
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  // 领取代币
  const claimTokens = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.betToken) return;
    
    setLoading(true);
    try {
      const betToken = new web3.eth.Contract(BET_TOKEN_ABI, CONTRACT_ADDRESSES.betToken);
      
      await betToken.methods.claimTokens().send({ from: account });
      
      await updateBalance(web3, account);
      showStatus('代币领取成功!', 'success');
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('领取代币失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 授权合约
  const approveTokens = async (amount: string) => {
    if (!web3 || !CONTRACT_ADDRESSES.betToken || !CONTRACT_ADDRESSES.easyBet) return;
    
    setLoading(true);
    try {
      const betToken = new web3.eth.Contract(BET_TOKEN_ABI, CONTRACT_ADDRESSES.betToken);
      const amountWei = web3.utils.toWei(amount, 'ether');
      
      await betToken.methods.approve(CONTRACT_ADDRESSES.easyBet, amountWei).send({ from: account });
      
      showStatus('授权成功!', 'success');
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('授权失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 创建项目 - 重点修改：直接获取项目ID
  const createProject = async (projectData: {
    title: string;
    description: string;
    options: string[];
    ticketPrice: string;
    maxTickets: number;
    duration: number;
  }) => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      const ticketPriceWei = web3.utils.toWei(projectData.ticketPrice, 'ether');
      
      // 直接调用合约方法并获取返回值（项目ID）
      const result = await easyBet.methods.createProject(
        projectData.title,
        projectData.description,
        projectData.options,
        ticketPriceWei,
        projectData.maxTickets,
        projectData.duration
      ).send({ from: account });
      
      // 从交易收据中获取项目ID
      let projectId: number | null = null;
      
      // 方法1: 从事件中获取
 
      
      // 方法2: 从交易收据的logs中解析
      if (!projectId && result.logs && result.logs.length > 0) {
        // 这里需要根据实际的事件ABI来解析，简化处理
        for (const log of result.logs) {
          if (log.topics && log.topics[0] === web3.utils.keccak256('ProjectCreated(uint256,address,string,uint256)')) {
            projectId = parseInt(log.topics[1], 16);
            break;
          }
        }
      }
      
      if (projectId) {
        // 添加到最近创建的项目列表
        setRecentProjectIds(prev => [projectId!, ...prev]);
        showStatus(`项目创建成功! 项目ID: ${projectId}`, 'success');
        
        // 自动选中新创建的项目
        setSelectedProjectId(projectId.toString());
        
        // 重新加载项目列表
        await loadProjects();
      } else {
        showStatus('项目创建成功，但无法获取项目ID，请手动查看项目列表', 'success');
      }
      
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('创建项目失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 购买彩票
  const purchaseTicket = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    const projectId = selectedProjectId || (document.getElementById('purchaseProjectId') as HTMLInputElement)?.value;
    const optionIndex = (document.getElementById('purchaseOption') as HTMLInputElement)?.value;
    
    if (!projectId || !optionIndex) {
      showStatus('请选择项目和选项', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      
      await easyBet.methods.purchaseTicket(projectId, optionIndex).send({ from: account });
      
      showStatus('彩票购买成功!', 'success');
      await updateBalance(web3, account);
      await loadMyTickets(web3, account);
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('购买彩票失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 挂单出售
  const listTicket = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    const ticketId = (document.getElementById('sellTicketId') as HTMLInputElement)?.value;
    const price = (document.getElementById('sellPrice') as HTMLInputElement)?.value;
    
    if (!ticketId || !price) {
      showStatus('请输入彩票ID和价格', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      const priceWei = web3.utils.toWei(price, 'ether');
      
      await easyBet.methods.listTicket(ticketId, priceWei).send({ from: account });
      
      showStatus('挂单成功!', 'success');
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('挂单失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 购买挂单
  const buyListedTicket = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    const orderId = (document.getElementById('buyOrderId') as HTMLInputElement)?.value;
    
    if (!orderId) {
      showStatus('请输入订单ID', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      
      await easyBet.methods.buyListedTicket(orderId).send({ from: account });
      
      showStatus('购买成功!', 'success');
      await updateBalance(web3, account);
      await loadMyTickets(web3, account);
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('购买挂单失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 结算项目
  const settleProject = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    const projectId = selectedProjectId || (document.getElementById('settleProjectId') as HTMLInputElement)?.value;
    const winningOption = (document.getElementById('winningOption') as HTMLInputElement)?.value;
    
    if (!projectId || !winningOption) {
      showStatus('请输入项目ID和获胜选项', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      
      await easyBet.methods.settleProject(projectId, winningOption).send({ from: account });
      
      showStatus('项目结算成功!', 'success');
    } catch (error) {
      const errorMessage = handleTransactionError(error);
      console.error('结算项目失败:', error);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 加载我的彩票
  const loadMyTickets = async (web3Instance: Web3, accountAddress: string) => {
    if (!CONTRACT_ADDRESSES.ticketNFT) return;
    
    try {
      const ticketNFT = new web3Instance.eth.Contract(TICKET_NFT_ABI, CONTRACT_ADDRESSES.ticketNFT);
      const ticketIdsResult: Web3CallResult<string[]> = await ticketNFT.methods.getTicketsByOwner(accountAddress).call();
      
      const ticketIdsArray = Array.isArray(ticketIdsResult) ? ticketIdsResult : [];
      
      const ticketsData: Ticket[] = [];
      for (const ticketId of ticketIdsArray) {
        const ticketInfo = await ticketNFT.methods.getTicketInfo(ticketId).call() as TicketInfo;
        ticketsData.push({
          id: parseInt(ticketId),
          projectId: parseInt(ticketInfo.projectId),
          optionIndex: parseInt(ticketInfo.optionIndex),
          purchasePrice: web3Instance.utils.fromWei(ticketInfo.purchasePrice, 'ether'),
          purchaseTime: parseInt(ticketInfo.purchaseTime)
        });
      }
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('加载彩票失败:', error);
    }
  };

  // 加载项目列表
  const loadProjects = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      const activeProjectIdsResult: Web3CallResult<string[]> = await easyBet.methods.getActiveProjects().call();
      
      const activeProjectIdsArray = Array.isArray(activeProjectIdsResult) ? activeProjectIdsResult : [];
      
      const projectsData: Project[] = [];
      for (const projectId of activeProjectIdsArray) {
        const projectData = await easyBet.methods.getProject(projectId).call() as ProjectData;
        projectsData.push({
          id: parseInt(projectData.id),
          title: projectData.title,
          description: projectData.description,
          options: projectData.options,
          endTime: parseInt(projectData.endTime),
          ticketPrice: web3.utils.fromWei(projectData.ticketPrice, 'ether'),
          maxTickets: parseInt(projectData.maxTickets),
          totalPrize: web3.utils.fromWei(projectData.totalPrize, 'ether'),
          soldTickets: parseInt(projectData.soldTickets),
          creator: projectData.creator,
          status: parseInt(projectData.status),
          winningOption: parseInt(projectData.winningOption)
        });
      }
      
      setProjects(projectsData);
      showStatus(`加载了 ${projectsData.length} 个项目`, 'success');
    } catch (error) {
      console.error('加载项目失败:', error);
      showStatus('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 加载订单簿
  const loadOrderBook = async () => {
    if (!web3 || !CONTRACT_ADDRESSES.easyBet) return;
    
    const projectId = selectedProjectId || (document.getElementById('orderBookProjectId') as HTMLInputElement)?.value;
    
    if (!projectId) {
      showStatus('请输入项目ID', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const easyBet = new web3.eth.Contract(EASY_BET_ABI, CONTRACT_ADDRESSES.easyBet);
      const orderIdsResult: Web3CallResult<string[]> = await easyBet.methods.getProjectOrderBook(projectId).call();
      
      const orderIdsArray = Array.isArray(orderIdsResult) ? orderIdsResult : [];
      
      const ordersData: Order[] = [];
      for (const orderId of orderIdsArray) {
        const orderData = await easyBet.methods.getOrder(orderId).call() as OrderData;
        if (orderData.active) {
          ordersData.push({
            id: parseInt(orderId),
            ticketId: parseInt(orderData.ticketId),
            projectId: parseInt(orderData.projectId),
            seller: orderData.seller,
            price: web3.utils.fromWei(orderData.price, 'ether'),
            createTime: parseInt(orderData.createTime),
            active: orderData.active
          });
        }
      }
      
      setOrders(ordersData);
      showStatus(`加载了 ${ordersData.length} 个订单`, 'success');
    } catch (error) {
      console.error('加载订单簿失败:', error);
      showStatus('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 显示状态消息
  const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  // 快速填充项目ID到表单
  const fillProjectId = (projectId: number, fieldId?: string) => {
    if (fieldId) {
      const input = document.getElementById(fieldId) as HTMLInputElement;
      if (input) input.value = projectId.toString();
    }
    setSelectedProjectId(projectId.toString());
    showStatus(`已选择项目ID: ${projectId}`, 'info');
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          if (web3) {
            updateBalance(web3, accounts[0]);
            loadMyTickets(web3, accounts[0]);
          }
        } else {
          setAccount('');
          setBalance('0');
          setTickets([]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [web3]);

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 EasyBet - 去中心化彩票系统</h1>
        <p>购买、交易、赢取 - 完全去中心化的彩票体验</p>
      </header>

      {/* 钱包连接 */}
      <div className="section">
        <h2>🔗 钱包连接</h2>
        {!account ? (
          <button onClick={initWeb3} disabled={loading}>
            {loading ? '连接中...' : '连接 MetaMask 钱包'}
          </button>
        ) : (
          <div className="wallet-info">
            <p><strong>连接地址:</strong> {account}</p>
            <p><strong>EBET 余额:</strong> {balance}</p>
            <button onClick={() => updateBalance(web3!, account)}>刷新余额</button>
          </div>
        )}
      </div>

      {/* 状态显示 */}
      {status && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* 当前选中的项目ID */}
      {selectedProjectId && (
        <div className="section selected-project">
          <h2>🎯 当前选中项目</h2>
          <div className="selected-project-info">
            <p><strong>项目ID:</strong> {selectedProjectId}</p>
            <button onClick={() => setSelectedProjectId('')}>清除选择</button>
          </div>
        </div>
      )}

      {/* 最近创建的项目ID */}
      {recentProjectIds.length > 0 && (
        <div className="section">
          <h2>📝 最近创建的项目</h2>
          <div className="recent-projects">
            {recentProjectIds.map(projectId => (
              <div key={projectId} className="project-id-item">
                <span>项目ID: <strong>{projectId}</strong></span>
                <div className="project-id-actions">
                  <button onClick={() => fillProjectId(projectId)}>选择</button>
                  <button onClick={() => fillProjectId(projectId, 'purchaseProjectId')}>购买彩票</button>
                  <button onClick={() => fillProjectId(projectId, 'orderBookProjectId')}>查看订单</button>
                  <button onClick={() => fillProjectId(projectId, 'settleProjectId')}>结算项目</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid">
        {/* 左侧功能 */}
        <div>
          {/* 代币领取 */}
          <div className="section">
            <h2>🎁 领取测试代币</h2>
            <button onClick={claimTokens} disabled={!account || loading}>
              {loading ? '领取中...' : '领取 100 EBET 测试代币'}
            </button>
          </div>

          {/* 授权合约 */}
          <div className="section">
            <h2>🔐 授权合约</h2>
            <div className="form-group">
              <input 
                type="number" 
                placeholder="授权数量" 
                defaultValue="1000"
                id="approveAmount"
              />
            </div>
            <button onClick={() => {
              const amount = (document.getElementById('approveAmount') as HTMLInputElement)?.value || '1000';
              approveTokens(amount);
            }} disabled={!account || loading}>
              {loading ? '授权中...' : '授权 EasyBet 合约使用 EBET'}
            </button>
          </div>

          {/* 创建项目 */}
          <CreateProjectForm onCreateProject={createProject} disabled={!account || loading} />
        </div>

        {/* 右侧功能 */}
        <div>
          {/* 购买彩票 */}
          <div className="section">
            <h2>🎫 购买彩票</h2>
            <div className="form-group">
              <label>项目ID (当前选中: {selectedProjectId || '无'})</label>
              <input type="number" placeholder="项目ID" id="purchaseProjectId" />
            </div>
            <div className="form-group">
              <label>选择选项</label>
              <input type="number" placeholder="选项索引 (0,1,2...)" id="purchaseOption" />
            </div>
            <button onClick={purchaseTicket} disabled={!account || loading}>
              {loading ? '购买中...' : '购买彩票'}
            </button>
          </div>

          {/* 交易彩票 */}
          <div className="section">
            <h2>💰 交易彩票</h2>
            <div className="form-group">
              <input type="number" placeholder="彩票 ID" id="sellTicketId" />
            </div>
            <div className="form-group">
              <input type="number" placeholder="出售价格" id="sellPrice" />
            </div>
            <button onClick={listTicket} disabled={!account || loading}>
              {loading ? '挂单中...' : '挂单出售'}
            </button>
          </div>

          {/* 购买挂单 */}
          <div className="section">
            <h2>🛒 购买挂单</h2>
            <div className="form-group">
              <input type="number" placeholder="订单 ID" id="buyOrderId" />
            </div>
            <button onClick={buyListedTicket} disabled={!account || loading}>
              {loading ? '购买中...' : '购买挂单'}
            </button>
          </div>

          {/* 结算项目 */}
          <div className="section">
            <h2>🏆 结算项目</h2>
            <div className="form-group">
              <label>项目ID (当前选中: {selectedProjectId || '无'})</label>
              <input type="number" placeholder="项目ID" id="settleProjectId" />
            </div>
            <div className="form-group">
              <label>获胜选项索引</label>
              <input type="number" placeholder="获胜选项索引" id="winningOption" />
            </div>
            <button onClick={settleProject} disabled={!account || loading}>
              {loading ? '结算中...' : '结算项目'}
            </button>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="section">
        <h2>📊 所有项目列表</h2>
        <button onClick={loadProjects} disabled={!account || loading}>
          {loading ? '加载中...' : '加载项目列表'}
        </button>
        <div className="projects-list">
          {projects.length === 0 ? (
            <p>暂无项目，请先创建项目</p>
          ) : (
            projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onSelect={fillProjectId}
                isSelected={selectedProjectId === project.id.toString()}
              />
            ))
          )}
        </div>
      </div>

      {/* 订单簿 */}
      <div className="section">
        <h2>📈 订单簿</h2>
        <div className="form-group">
          <label>项目ID (当前选中: {selectedProjectId || '无'})</label>
          <input type="number" placeholder="项目ID" id="orderBookProjectId" />
        </div>
        <button onClick={loadOrderBook} disabled={!account || loading}>
          {loading ? '加载中...' : '加载订单簿'}
        </button>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p>暂无订单</p>
          ) : (
            orders.map(order => (
              <OrderCard key={order.id} order={order} onBuy={buyListedTicket} />
            ))
          )}
        </div>
      </div>

      {/* 我的彩票 */}
      <div className="section">
        <h2>🎟️ 我的彩票</h2>
        <button onClick={() => loadMyTickets(web3!, account)} disabled={!account}>
          刷新我的彩票
        </button>
        <div className="tickets-list">
          {tickets.length === 0 ? (
            <p>暂无彩票</p>
          ) : (
            tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 创建项目表单组件
const CreateProjectForm: React.FC<{
  onCreateProject: (data: any) => void;
  disabled: boolean;
}> = ({ onCreateProject, disabled }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    onCreateProject({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      options: (formData.get('options') as string).split(',').map(opt => opt.trim()),
      ticketPrice: formData.get('ticketPrice') as string,
      maxTickets: parseInt(formData.get('maxTickets') as string),
      duration: parseInt(formData.get('duration') as string)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="section">
      <h2>📋 创建竞猜项目</h2>
      <div className="form-group">
        <input name="title" type="text" placeholder="项目标题" required />
      </div>
      <div className="form-group">
        <textarea name="description" placeholder="项目描述" required />
      </div>
      <div className="form-group">
        <input name="options" type="text" placeholder="竞猜选项 (用逗号分隔)" required />
      </div>
      <div className="form-group">
        <input name="ticketPrice" type="number" placeholder="彩票价格" defaultValue="10" required />
      </div>
      <div className="form-group">
        <input name="maxTickets" type="number" placeholder="最大彩票数量" defaultValue="100" required />
      </div>
      <div className="form-group">
        <input name="duration" type="number" placeholder="持续时间(秒)" defaultValue="3600" required />
      </div>
      <button type="submit" disabled={disabled}>
        {disabled ? '创建中...' : '创建项目'}
      </button>
    </form>
  );
};

// 项目卡片组件 - 增强版
const ProjectCard: React.FC<{ 
  project: Project; 
  onSelect: (projectId: number) => void;
  isSelected: boolean;
}> = ({ project, onSelect, isSelected }) => {
  return (
    <div className={`project-card ${isSelected ? 'selected' : ''}`}>
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="project-id">ID: {project.id}</span>
      </div>
      <p>{project.description}</p>
      <div className="project-meta">
        <span>价格: {project.ticketPrice} EBET</span>
        <span>已售: {project.soldTickets}/{project.maxTickets}</span>
        <span>奖池: {project.totalPrize} EBET</span>
      </div>
      <div className="project-options">
        <strong>选项:</strong> {project.options.map((opt, idx) => (
          <span key={idx} className="option">{idx}: {opt}</span>
        ))}
      </div>
      <div className="project-time">
        结束时间: {new Date(project.endTime * 1000).toLocaleString()}
      </div>
      <div className="project-actions">
        <button onClick={() => onSelect(project.id)} className="btn-select">
          {isSelected ? '已选中' : '选择此项目'}
        </button>
      </div>
    </div>
  );
};

// 彩票卡片组件
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <div className="ticket-card">
      <h4>彩票 #{ticket.id}</h4>
      <div className="ticket-info">
        <p><strong>项目ID:</strong> {ticket.projectId}</p>
        <p><strong>选项索引:</strong> {ticket.optionIndex}</p>
        <p><strong>购买价格:</strong> {ticket.purchasePrice} EBET</p>
        <p><strong>购买时间:</strong> {new Date(ticket.purchaseTime * 1000).toLocaleString()}</p>
      </div>
    </div>
  );
};

// 订单卡片组件
const OrderCard: React.FC<{ 
  order: Order; 
  onBuy: (orderId: number) => void;
}> = ({ order, onBuy }) => {
  return (
    <div className="order-card">
      <h4>订单 #{order.id}</h4>
      <div className="order-info">
        <p><strong>彩票ID:</strong> {order.ticketId}</p>
        <p><strong>项目ID:</strong> {order.projectId}</p>
        <p><strong>卖家:</strong> {order.seller}</p>
        <p><strong>价格:</strong> {order.price} EBET</p>
        <p><strong>创建时间:</strong> {new Date(order.createTime * 1000).toLocaleString()}</p>
      </div>
      <button onClick={() => onBuy(order.id)} className="btn-buy">
        购买
      </button>
    </div>
  );
};

export default App;