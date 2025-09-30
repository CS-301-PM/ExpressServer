// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Generic Logger with Mandatory Peer Approval
/// @notice A general-purpose logging contract that records any data after 2-of-3 peer approval
/// @dev All logged entries are stored and retrievable as arrays/lists
contract GenericLoggerPeerApproved {
    
    // ===========================================
    // STATE VARIABLES
    // ===========================================
    
    /// @notice The three trusted peers who can approve entries
    address[3] public peers;
    
    /// @notice Structure for a logged entry
    struct LogEntry {
        uint256 id;
        address proposer;
        string category;  // Type/category of the log entry
        string data;      // The actual data being logged (JSON, text, etc.)
        uint256 timestamp;
        bool executed;
    }
    
    /// @notice All successfully logged entries
    LogEntry[] public logEntries;
    
    /// @notice Pending proposals awaiting approval
    mapping(uint256 => LogEntry) public pendingEntries;
    
    /// @notice Track approvals for each pending entry
    mapping(uint256 => mapping(address => bool)) public approvals;
    
    /// @notice Count of approvals for each pending entry
    mapping(uint256 => uint8) public approvalCount;
    
    /// @notice Counter for unique entry IDs
    uint256 public nextEntryId = 1;
    
    // ===========================================
    // EVENTS
    // ===========================================
    
    event EntryProposed(
        uint256 indexed entryId,
        address indexed proposer,
        string indexed category,
        string data
    );
    
    event EntryApproved(
        uint256 indexed entryId,
        address indexed approver,
        uint8 totalApprovals
    );
    
    event EntryLogged(
        uint256 indexed entryId,
        address indexed proposer,
        string indexed category,
        string data,
        uint256 timestamp
    );
    
    // ===========================================
    // ERRORS
    // ===========================================
    
    error NotAuthorizedPeer();
    error EntryNotFound();
    error EntryAlreadyExecuted();
    error AlreadyApproved();
    error InvalidPeerAddress();
    error DuplicatePeerAddress();
    
    // ===========================================
    // CONSTRUCTOR
    // ===========================================
    
    constructor(address[3] memory _peers) {
        // Validate peers
        for (uint i = 0; i < 3; i++) {
            if (_peers[i] == address(0)) revert InvalidPeerAddress();
            for (uint j = i + 1; j < 3; j++) {
                if (_peers[i] == _peers[j]) revert DuplicatePeerAddress();
            }
        }
        peers = _peers;
    }
    
    // ===========================================
    // MODIFIERS
    // ===========================================
    
    modifier onlyPeer() {
        bool isPeer = false;
        for (uint i = 0; i < 3; i++) {
            if (msg.sender == peers[i]) {
                isPeer = true;
                break;
            }
        }
        if (!isPeer) revert NotAuthorizedPeer();
        _;
    }
    
    // ===========================================
    // CORE FUNCTIONS
    // ===========================================
    
    /// @notice Propose a new entry to be logged
    /// @param category Category/type of the entry (e.g., "USER_SIGNUP", "TRANSACTION", "STATUS_UPDATE")
    /// @param data The data to log (can be JSON, plain text, structured data, etc.)
    /// @return entryId The unique ID of the proposed entry
    function proposeEntry(
        string memory category,
        string memory data
    ) public returns (uint256 entryId) {
        entryId = nextEntryId++;
        
        pendingEntries[entryId] = LogEntry({
            id: entryId,
            proposer: msg.sender,
            category: category,
            data: data,
            timestamp: block.timestamp,
            executed: false
        });
        
        emit EntryProposed(entryId, msg.sender, category, data);
        return entryId;
    }
    
    /// @notice Peer approves a pending entry
    /// @param entryId ID of the entry to approve
    function approveEntry(uint256 entryId) external onlyPeer {
        LogEntry storage entry = pendingEntries[entryId];
        if (entry.id == 0) revert EntryNotFound();
        if (entry.executed) revert EntryAlreadyExecuted();
        if (approvals[entryId][msg.sender]) revert AlreadyApproved();
        
        approvals[entryId][msg.sender] = true;
        approvalCount[entryId]++;
        
        emit EntryApproved(entryId, msg.sender, approvalCount[entryId]);
        
        // Execute if we have at least 2 approvals
        if (approvalCount[entryId] >= 2) {
            _executeEntry(entryId);
        }
    }
    
    /// @notice Internal function to execute an approved entry
    /// @param entryId ID of the entry to execute
    function _executeEntry(uint256 entryId) internal {
        LogEntry storage pendingEntry = pendingEntries[entryId];
        pendingEntry.executed = true;
        
        // Add to permanent log
        logEntries.push(pendingEntry);
        
        emit EntryLogged(
            entryId,
            pendingEntry.proposer,
            pendingEntry.category,
            pendingEntry.data,
            pendingEntry.timestamp
        );
        
        // Clean up storage to save gas
        delete approvalCount[entryId];
        for (uint i = 0; i < 3; i++) {
            delete approvals[entryId][peers[i]];
        }
    }
    
    // ===========================================
    // VIEW FUNCTIONS - GET LISTS/ARRAYS
    // ===========================================
    
    /// @notice Get all logged entries
    /// @return All successfully logged entries
    function getAllEntries() external view returns (LogEntry[] memory) {
        return logEntries;
    }
    
    /// @notice Get logged entries by category
    /// @param category The category to filter by
    /// @return Filtered entries matching the category
    function getEntriesByCategory(string calldata category) external view returns (LogEntry[] memory) {
        uint256 count = 0;
        
        // First pass: count matching entries
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (keccak256(abi.encodePacked(logEntries[i].category)) == keccak256(abi.encodePacked(category))) {
                count++;
            }
        }
        
        // Second pass: collect matching entries
        LogEntry[] memory result = new LogEntry[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (keccak256(abi.encodePacked(logEntries[i].category)) == keccak256(abi.encodePacked(category))) {
                result[resultIndex] = logEntries[i];
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /// @notice Get logged entries by proposer
    /// @param proposer The address of the proposer
    /// @return Filtered entries by the specified proposer
    function getEntriesByProposer(address proposer) external view returns (LogEntry[] memory) {
        uint256 count = 0;
        
        // Count matching entries
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (logEntries[i].proposer == proposer) {
                count++;
            }
        }
        
        // Collect matching entries
        LogEntry[] memory result = new LogEntry[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (logEntries[i].proposer == proposer) {
                result[resultIndex] = logEntries[i];
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /// @notice Get entries within a time range
    /// @param startTime Start timestamp (inclusive)
    /// @param endTime End timestamp (inclusive)
    /// @return Entries within the specified time range
    function getEntriesByTimeRange(uint256 startTime, uint256 endTime) external view returns (LogEntry[] memory) {
        uint256 count = 0;
        
        // Count matching entries
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (logEntries[i].timestamp >= startTime && logEntries[i].timestamp <= endTime) {
                count++;
            }
        }
        
        // Collect matching entries
        LogEntry[] memory result = new LogEntry[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < logEntries.length; i++) {
            if (logEntries[i].timestamp >= startTime && logEntries[i].timestamp <= endTime) {
                result[resultIndex] = logEntries[i];
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /// @notice Get recent entries (last N entries)
    /// @param count Number of recent entries to return
    /// @return The most recent entries
    function getRecentEntries(uint256 count) external view returns (LogEntry[] memory) {
        if (count > logEntries.length) {
            count = logEntries.length;
        }
        
        LogEntry[] memory result = new LogEntry[](count);
        uint256 startIndex = logEntries.length - count;
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = logEntries[startIndex + i];
        }
        
        return result;
    }
    
    /// @notice Get total number of logged entries
    /// @return Total count of successfully logged entries
    function getTotalEntryCount() external view returns (uint256) {
        return logEntries.length;
    }
    
    /// @notice Get a specific entry by its array index
    /// @param index Array index of the entry
    /// @return The log entry at the specified index
    function getEntryByIndex(uint256 index) external view returns (LogEntry memory) {
        require(index < logEntries.length, "Index out of bounds");
        return logEntries[index];
    }
    
    /// @notice Get pending entry details
    /// @param entryId ID of the pending entry
    /// @return The pending entry details
    function getPendingEntry(uint256 entryId) external view returns (LogEntry memory) {
        return pendingEntries[entryId];
    }
    
    /// @notice Get approval status for a pending entry
    /// @param entryId ID of the entry
    /// @return currentApprovals Number of approvals received
    /// @return peerApprovals Array showing which peers have approved
    function getApprovalStatus(uint256 entryId) external view returns (
        uint8 currentApprovals,
        bool[3] memory peerApprovals
    ) {
        currentApprovals = approvalCount[entryId];
        for (uint i = 0; i < 3; i++) {
            peerApprovals[i] = approvals[entryId][peers[i]];
        }
    }
    
    // ===========================================
    // CONVENIENCE FUNCTIONS (OPTIONAL)
    // ===========================================
    
    /// @notice Quick function to log simple text
    /// @param text The text to log
    /// @return entryId ID of the proposed entry
    function logText(string calldata text) external returns (uint256) {
        return proposeEntry("TEXT", text);
    }
    
    /// @notice Quick function to log JSON data
    /// @param jsonData JSON formatted data
    /// @return entryId ID of the proposed entry
    function logJSON(string calldata jsonData) external returns (uint256) {
        return proposeEntry("JSON", jsonData);
    }
    
    /// @notice Quick function to log an event
    /// @param eventName Name of the event
    /// @param eventData Event data
    /// @return entryId ID of the proposed entry
    function logEvent(string calldata eventName, string calldata eventData) external returns (uint256) {
        return proposeEntry(eventName, eventData);
    }
}