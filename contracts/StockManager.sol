// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StockManager {
    struct Stock {
        string name;
        uint256 quantity;
        bool exists;
    }

    mapping(uint256 => Stock) public stocks;
    uint256 public nextStockId;

    address[3] public peers;

    constructor(address[3] memory _peers) {
        peers = _peers;
    }

    modifier onlyPeer() {
        bool allowed = false;
        for (uint i = 0; i < peers.length; i++) {
            if (msg.sender == peers[i]) {
                allowed = true;
                break;
            }
        }
        require(allowed, "Not authorized peer");
        _;
    }

    event StockCreated(uint256 id, string name, uint256 quantity);
    event StockUpdated(uint256 id, string name, uint256 quantity);
    event StockDeleted(uint256 id);

    mapping(uint256 => mapping(address => bool)) private createApprovals;
    mapping(uint256 => uint8) private createCount;

    function proposeStock(string memory _name, uint256 _quantity) external onlyPeer returns (uint256) {
        uint256 id = nextStockId++;
        createApprovals[id][msg.sender] = true;
        createCount[id] = 1;
        stocks[id] = Stock(_name, _quantity, false);
        return id;
    }

    function approveStock(uint256 _id) external onlyPeer {
        require(!stocks[_id].exists, "Already created");
        require(!createApprovals[_id][msg.sender], "Already approved");
        createApprovals[_id][msg.sender] = true;
        createCount[_id] += 1;

        if (createCount[_id] >= 2) {
            stocks[_id].exists = true;
            emit StockCreated(_id, stocks[_id].name, stocks[_id].quantity);
        }
    }

    function updateStock(uint256 _id, string memory _name, uint256 _quantity) external onlyPeer {
        require(stocks[_id].exists, "Stock not found");
        stocks[_id].name = _name;
        stocks[_id].quantity = _quantity;
        emit StockUpdated(_id, _name, _quantity);
    }

    function deleteStock(uint256 _id) external onlyPeer {
        require(stocks[_id].exists, "Stock not found");
        delete stocks[_id];
        emit StockDeleted(_id);
    }
}
