// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

import "./CortexToken.sol";

/// @title CortexDAO - Governance for a specific AI model community
/// @notice Handles proposals, voting, and execution for a single AI model DAO
contract CortexDAO is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    ReentrancyGuard
{
    using ECDSA for bytes32;

    /// @notice Token used for governance
    CortexToken public immutable governanceToken;

    /// @notice The AI model this DAO represents (e.g., "CLAUDE", "OPENAI", "GEMINI")
    string public modelName;

    /// @notice Minimum tokens required to propose
    uint256 public minProposalThreshold;

    /// @notice Voting delay (blocks)
    uint256 public votingDelayBlocks;

    /// @notice Voting period (blocks)
    uint256 public votingPeriodBlocks;

    /// @notice Quorum percentage (e.g., 4 = 4%)
    uint256 public quorumPercent = 4;

    /// @notice Verification contract address
    address public verifier;

    /// @notice Treasury address for funds
    address public treasury;

    /// @notice Bot check enabled
    bool public botCheckEnabled = true;

    /// @notice Map of verified agents
    mapping(address => bool) public verifiedAgents;

    /// @notice Events
    event AgentVerified(address indexed agent, string model);
    event AgentRevoked(address indexed agent);
    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        string title,
        string description
    );
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event BotCheckToggled(bool enabled);

    /// @param _token Governance token address
    /// @param _modelName Name of the AI model (e.g., "CLAUDE")
    /// @param _verifier Agent verification contract
    /// @param _treasury Treasury address
    constructor(
        CortexToken _token,
        string memory _modelName,
        address _verifier,
        address _treasury
    )
        Governor(string.concat("CortexDAO-", _modelName))
        GovernorVotes(IVotes(address(_token)))
        GovernorVotesQuorumFraction(quorumPercent)
    {
        require(address(_token) != address(0), "CortexDAO: zero token");
        require(_treasury != address(0), "CortexDAO: zero treasury");

        governanceToken = _token;
        modelName = _modelName;
        verifier = _verifier;
        treasury = _treasury;

        // Default governance parameters
        votingDelayBlocks = 7200; // ~1 day in blocks (12s block time)
        votingPeriodBlocks = 36000; // ~5 days in blocks
        minProposalThreshold = 100_000 * 1e18; // 100K tokens to propose
    }

    // ============ VERIFICATION ============

    /// @notice Verify an agent as a legitimate bot
    function verifyAgent(address agent) external {
        require(msg.sender == verifier, "CortexDAO: not verifier");
        verifiedAgents[agent] = true;
        emit AgentVerified(agent, modelName);
    }

    /// @notice Revoke an agent's verification
    function revokeAgent(address agent) external {
        require(msg.sender == verifier, "CortexDAO: not verifier");
        verifiedAgents[agent] = false;
        emit AgentRevoked(agent);
    }

    /// @notice Check if an address is a verified agent
    function isVerified(address account) external view returns (bool) {
        return verifiedAgents[account];
    }

    // ============ GOVERNANCE PARAMETERS ============

    function setVerifier(address _verifier) external onlyGovernance {
        address oldVerifier = verifier;
        verifier = _verifier;
        emit VerifierUpdated(oldVerifier, _verifier);
    }

    function setTreasury(address _treasury) external onlyGovernance {
        require(_treasury != address(0), "CortexDAO: zero treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    function setBotCheck(bool enabled) external onlyGovernance {
        botCheckEnabled = enabled;
        emit BotCheckToggled(enabled);
    }

    // ============ PROPOSALS ============

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        // Bot check - require verification if enabled
        if (botCheckEnabled) {
            require(verifiedAgents[msg.sender], "CortexDAO: not verified agent");
        }

        uint256 proposalId = super.propose(
            targets,
            values,
            calldatas,
            description
        );

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _getTitleFromDescription(description),
            description
        );

        return proposalId;
    }

    /// @notice Extract title from description (first line)
    function _getTitleFromDescription(
        string memory description
    ) internal pure returns (string memory) {
        bytes memory descBytes = bytes(description);
        uint256 newlineIndex = 0;

        for (uint256 i = 0; i < descBytes.length; i++) {
            if (descBytes[i] == bytes1("\n")) {
                newlineIndex = i;
                break;
            }
        }

        if (newlineIndex == 0) {
            return description;
        }

        bytes memory titleBytes = new bytes(newlineIndex);
        for (uint256 i = 0; i < newlineIndex; i++) {
            titleBytes[i] = descBytes[i];
        }

        return string(titleBytes);
    }

    // ============ OVERRIDES ============

    function votingDelay()
        public
        view
        override
        returns (uint256)
    {
        return votingDelayBlocks;
    }

    function votingPeriod()
        public
        view
        override
        returns (uint256)
    {
        return votingPeriodBlocks;
    }

    function proposalThreshold()
        public
        view
        override
        returns (uint256)
    {
        return minProposalThreshold;
    }

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(
        uint256 proposalId
    ) public view override returns (ProposalState) {
        return super.state(proposalId);
    }

    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable override returns (uint256) {
        return super.execute(targets, values, calldatas, descriptionHash);
    }

    // ============ TOKEN CLAIMS ============

    /// @notice Claim tokens for verified agents (distribution)
    function claimTokens(address recipient, uint256 amount) external onlyGovernance {
        governanceToken.mint(recipient, amount);
    }
}
