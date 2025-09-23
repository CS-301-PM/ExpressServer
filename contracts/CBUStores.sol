// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CBUStores {
    struct Request {
        uint256 id;
        address requester;
        string itemName;
        uint256 quantity;
        string priority;
        string reason;
        bool approved;
        bool fulfilled;
    }
    
    mapping(address => mapping(string => bool)) public roles;
    mapping(uint256 => Request) public requests;
    uint256 public requestCount;
    
    event RoleAssigned(address indexed user, string role, bool status);
    event RequestCreated(uint256 indexed requestId, address indexed requester, string itemName, uint256 quantity);
    event RequestApproved(uint256 indexed requestId, address indexed approver, bool approved, string reason);
    
    function getContractInfo() public pure returns (string memory) {
        return "CBU Central Stores Contract v1.0";
    }
    
    function assignRole(address user, string memory role, bool status) public {
        roles[user][role] = status;
        emit RoleAssigned(user, role, status);
    }
    
    function createRequest(
        string memory itemName,
        uint256 quantity,
        string memory priority,
        string memory reason
    ) public returns (uint256) {
        requestCount++;
        requests[requestCount] = Request({
            id: requestCount,
            requester: msg.sender,
            itemName: itemName,
            quantity: quantity,
            priority: priority,
            reason: reason,
            approved: false,
            fulfilled: false
        });
        
        emit RequestCreated(requestCount, msg.sender, itemName, quantity);
        return requestCount;
    }
    
    function approveRequest(uint256 requestId, bool approved, string memory reason) public {
        require(requests[requestId].id != 0, "Request does not exist");
        requests[requestId].approved = approved;
        emit RequestApproved(requestId, msg.sender, approved, reason);
    }
    
    function hasRole(address user, string memory role) public view returns (bool) {
        return roles[user][role];
    }
}