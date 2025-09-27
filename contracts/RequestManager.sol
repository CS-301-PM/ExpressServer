// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RequestManager {
    enum Status { PENDING, APPROVED, REJECTED, IN_PROGRESS, FULFILLED }

    struct Request {
        uint256 id;
        address requester;
        string item;
        uint256 quantity;
        Status status;
        bool exists;
    }

    mapping(uint256 => Request) public requests;
    uint256 public nextRequestId;

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

    event RequestCreated(uint256 id, address requester, string item, uint256 quantity);
    event RequestStatusUpdated(uint256 id, Status status);

    function createRequest(string memory _item, uint256 _quantity) external returns (uint256) {
        uint256 reqId = nextRequestId++;
        requests[reqId] = Request(reqId, msg.sender, _item, _quantity, Status.PENDING, true);
        emit RequestCreated(reqId, msg.sender, _item, _quantity);
        return reqId;
    }

    mapping(uint256 => mapping(address => bool)) private approveCount;
    mapping(uint256 => uint8) private approvalNum;

    function approveRequest(uint256 _id, Status _newStatus) external onlyPeer {
        require(requests[_id].exists, "Request not found");
        Status current = requests[_id].status;

        require(
            (current == Status.PENDING && (_newStatus == Status.APPROVED || _newStatus == Status.REJECTED)) ||
            (current == Status.APPROVED && _newStatus == Status.IN_PROGRESS) ||
            (current == Status.IN_PROGRESS && _newStatus == Status.FULFILLED),
            "Invalid status transition"
        );

        require(!approveCount[_id][msg.sender], "Already approved");
        approveCount[_id][msg.sender] = true;
        approvalNum[_id] += 1;

        if (approvalNum[_id] >= 2) {
            requests[_id].status = _newStatus;
            emit RequestStatusUpdated(_id, _newStatus);
        }
    }
}
