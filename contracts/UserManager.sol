// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserManager {
    struct User {
        string name;
        bool exists;
    }

    mapping(address => User) public users;

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

    event UserSignedUp(address indexed user, string name);
    event UserSignedIn(address indexed user);
    event UserSignedOut(address indexed user);
    event UserUpdated(address indexed user, string newName);
    event UserDeleted(address indexed user);

    function signup(string memory _name) external {
        require(!users[msg.sender].exists, "User exists");
        users[msg.sender] = User(_name, true);
        emit UserSignedUp(msg.sender, _name);
    }

    mapping(address => mapping(address => bool)) private deleteApprovals;
    mapping(address => uint8) private deleteCount;

    function approveDelete(address _user) external onlyPeer {
        require(users[_user].exists, "User not found");
        require(!deleteApprovals[_user][msg.sender], "Already approved");
        deleteApprovals[_user][msg.sender] = true;
        deleteCount[_user] += 1;

        if (deleteCount[_user] >= 2) {
            delete users[_user];
            deleteCount[_user];
            emit UserDeleted(_user);
        }
    }

    function signin() external {
        require(users[msg.sender].exists, "User not registered");
        emit UserSignedIn(msg.sender);
    }

    function signout() external {
        require(users[msg.sender].exists, "User not registered");
        emit UserSignedOut(msg.sender);
    }

    function update(string memory _newName) external {
        require(users[msg.sender].exists, "User not registered");
        users[msg.sender].name = _newName;
        emit UserUpdated(msg.sender, _newName);
    }
}
