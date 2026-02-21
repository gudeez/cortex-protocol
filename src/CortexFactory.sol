// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./CortexToken.sol";
import "./CortexDAO.sol";
import "./AgentVerifier.sol";

/// @title CortexFactory - Deploys Cortex DAOs for each AI model
/// @notice Factory contract that creates and tracks all Cortex DAO instances
contract CortexFactory is Ownable, ReentrancyGuard {
    /// @notice Deployed DAOs
    address[] public allDAOs;

    /// @notice DAO for a specific model
    mapping(string => address) public getDAO;

    /// @notice Token for a specific model
    mapping(string => address) public getToken;

    /// @notice All supported models
    string[] public supportedModels;

    /// @notice Protocol treasury
    address public treasury;

    /// @notice Deployment fee
    uint256 public deploymentFee = 0.01 ether;

    /// @notice Events
    event DAOCreated(
        string indexed modelName,
        address indexed dao,
        address indexed token,
        address verifier,
        address treasury
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DeploymentFeeUpdated(uint256 newFee);

    /// @param _owner Contract owner
    /// @param _treasury Protocol treasury
    constructor(address _owner, address _treasury) Ownable(_owner) {
        require(_treasury != address(0), "CortexFactory: zero treasury");
        treasury = _treasury;

        // Initialize supported models
        _initializeSupportedModels();
    }

    function _initializeSupportedModels() internal {
        supportedModels = [
            "CLAUDE",
            "OPENAI",
            "GEMINI",
            "GROK",
            "MINIMAX",
            "DEEPSEEK",
            "LLAMA",
            "MISTRAL",
            "COMMAND",
            "PHI",
            "OLYMPUS",
            "AJAX",
            "NOVA",
            "STABILITY",
            "JASPER",
            "PALM"
        ];
    }

    // ============ ADMIN ============

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "CortexFactory: zero treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /// @notice Update deployment fee
    function setDeploymentFee(uint256 _fee) external onlyOwner {
        deploymentFee = _fee;
        emit DeploymentFeeUpdated(_fee);
    }

    // ============ DAO DEPLOYMENT ============

    /// @notice Deploy a new Cortex DAO for a specific AI model
    /// @param _modelName Name of the AI model (e.g., "CLAUDE")
    /// @param _verifier Address of the AgentVerifier contract
    function deployDAO(
        string memory _modelName,
        address _verifier
    ) external payable nonReentrant returns (address newDAO, address newToken) {
        require(msg.value >= deploymentFee, "CortexFactory: insufficient fee");
        require(getDAO[_modelName] == address(0), "CortexFactory: DAO already exists");
        require(_verifier != address(0), "CortexFactory: zero verifier");

        // Create governance token
        string memory tokenName = string.concat("Cortex", _modelName);
        string memory tokenSymbol = string.concat("COR", _modelName);

        CortexToken newTokenContract = new CortexToken(tokenName, tokenSymbol);

        // Create DAO
        CortexDAO newDAOContract = new CortexDAO(
            newTokenContract,
            _modelName,
            _verifier,
            treasury
        );

        // Set DAO as token minter
        newTokenContract.setDAO(address(newDAOContract));

        // Store addresses
        address deployedDAO = address(newDAOContract);
        address deployedToken = address(newTokenContract);
        
        getDAO[_modelName] = deployedDAO;
        getToken[_modelName] = deployedToken;
        allDAOs.push(deployedDAO);

        // Refund excess fee
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }

        // Transfer deployment fee to treasury
        (bool success, ) = treasury.call{value: deploymentFee}("");
        require(success, "CortexFactory: transfer failed");

        emit DAOCreated(
            _modelName,
            deployedDAO,
            deployedToken,
            _verifier,
            treasury
        );

        return (deployedDAO, deployedToken);
    }

    // ============ QUERIES ============

    /// @notice Get total number of deployed DAOs
    function getDAOCount() external view returns (uint256) {
        return allDAOs.length;
    }

    /// @notice Get all deployed DAO addresses
    function getAllDAOs() external view returns (address[] memory) {
        return allDAOs;
    }

    /// @notice Get supported models
    function getSupportedModels() external view returns (string[] memory) {
        return supportedModels;
    }

    /// @notice Check if a model has a deployed DAO
    function isModelSupported(string memory _modelName) external view returns (bool) {
        return getDAO[_modelName] != address(0);
    }
}
