// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgentVerifier - Verifies AI agents and their model type
/// @notice Handles bot detection and model verification for Cortex Protocol
contract AgentVerifier is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    /// @notice Supported AI models
    enum ModelType {
        UNKNOWN,
        CLAUDE,      // Anthropic
        OPENAI,      // OpenAI (GPT)
        GEMINI,      // Google DeepMind
        GROK,        // xAI
        MINIMAX,     // MiniMax
        DEEPSEEK,    // DeepSeek
        LLAMA,       // Meta
        MISTRAL,     // Mistral AI
        COMMAND,     // Cohere
        PHI,         // Microsoft
        OLYMPUS,     // Amazon
        AJAX,        // Apple
        NOVA,        // AWS
        STABILITY,   // Stability AI
        JASPER,      // Jasper AI
        PALM,        // Google (deprecated)
        ANTHROPIC    // Generic Anthropic
    }

    /// @notice Model name to enum mapping
    mapping(string => ModelType) public modelNameToType;

    /// @notice Registered agent info
    struct AgentInfo {
        string modelName;
        ModelType modelType;
        uint256 registeredAt;
        bool isVerified;
        bytes32 registrationSignature;
    }

    /// @notice All registered agents
    mapping(address => AgentInfo) public agents;

    /// @notice DAOs for each model
    mapping(ModelType => address) public modelDAOs;

    /// @notice Protocol admin (can register new models)
    address public protocolAdmin;

    /// @notice x402 payment receiver
    address public paymentReceiver;

    /// @notice Verification fee (in native token)
    uint256 public verificationFee = 0.001 ether;

    /// @notice Events
    event AgentRegistered(
        address indexed agent,
        string modelName,
        ModelType modelType
    );
    event AgentVerified(address indexed agent);
    event ModelDAOConfigured(ModelType modelType, address daoAddress);
    event VerificationFeeUpdated(uint256 newFee);
    event PaymentReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    /// @param _owner Contract owner
    constructor(address _owner) Ownable(_owner) {
        // Initialize model mappings
        _initializeModelMappings();
    }

    function _initializeModelMappings() internal {
        modelNameToType["CLAUDE"] = ModelType.CLAUDE;
        modelNameToType["OPENAI"] = ModelType.OPENAI;
        modelNameToType["GPT"] = ModelType.OPENAI;
        modelNameToType["GEMINI"] = ModelType.GEMINI;
        modelNameToType["GROK"] = ModelType.GROK;
        modelNameToType["MINIMAX"] = ModelType.MINIMAX;
        modelNameToType["DEEPSEEK"] = ModelType.DEEPSEEK;
        modelNameToType["LLAMA"] = ModelType.LLAMA;
        modelNameToType["MISTRAL"] = ModelType.MISTRAL;
        modelNameToType["COMMAND"] = ModelType.COMMAND;
        modelNameToType["PHI"] = ModelType.PHI;
        modelNameToType["OLYMPUS"] = ModelType.OLYMPUS;
        modelNameToType["AJAX"] = ModelType.AJAX;
        modelNameToType["NOVA"] = ModelType.NOVA;
        modelNameToType["STABILITY"] = ModelType.STABILITY;
        modelNameToType["JASPER"] = ModelType.JASPER;
        modelNameToType["PALM"] = ModelType.PALM;
        modelNameToType["ANTHROPIC"] = ModelType.ANTHROPIC;
    }

    // ============ ADMIN ============

    /// @notice Set the DAO address for a specific model
    function setModelDAO(ModelType _modelType, address _dao) external onlyOwner {
        require(_dao != address(0), "AgentVerifier: zero DAO");
        modelDAOs[_modelType] = _dao;
        emit ModelDAOConfigured(_modelType, _dao);
    }

    /// @notice Set the payment receiver for x402
    function setPaymentReceiver(address _receiver) external onlyOwner {
        require(_receiver != address(0), "AgentVerifier: zero receiver");
        address oldReceiver = paymentReceiver;
        paymentReceiver = _receiver;
        emit PaymentReceiverUpdated(oldReceiver, _receiver);
    }

    /// @notice Set verification fee
    function setVerificationFee(uint256 _fee) external onlyOwner {
        verificationFee = _fee;
        emit VerificationFeeUpdated(_fee);
    }

    // ============ REGISTRATION ============

    /// @notice Register an agent with their model type
    /// @param _modelName The model name (e.g., "CLAUDE", "OPENAI")
    /// @param _signature Optional signature for additional verification
    function registerAgent(
        string memory _modelName,
        bytes calldata _signature
    ) external payable nonReentrant {
        // Bot check: require small payment to prevent spam
        require(msg.value >= verificationFee, "AgentVerifier: insufficient fee");

        ModelType modelType = modelNameToType[_modelName];
        require(modelType != ModelType.UNKNOWN, "AgentVerifier: unknown model");

        // Store agent info
        agents[msg.sender] = AgentInfo({
            modelName: _modelName,
            modelType: modelType,
            registeredAt: block.timestamp,
            isVerified: false,
            registrationSignature: keccak256(_signature)
        });

        emit AgentRegistered(msg.sender, _modelName, modelType);

        // Refund excess payment
        if (msg.value > verificationFee) {
            payable(msg.sender).transfer(msg.value - verificationFee);
        }

        // Forward fee to payment receiver if set
        if (paymentReceiver != address(0)) {
            (bool success, ) = paymentReceiver.call{value: verificationFee}("");
            require(success, "AgentVerifier: transfer failed");
        }
    }

    /// @notice Verify an agent (called after registration)
    function verifyAgent(address _agent) external {
        // Only the corresponding DAO can verify
        AgentInfo memory info = agents[_agent];
        require(info.registeredAt > 0, "AgentVerifier: not registered");
        require(modelDAOs[info.modelType] == msg.sender, "AgentVerifier: not authorized");

        agents[_agent].isVerified = true;
        emit AgentVerified(_agent);
    }

    // ============ QUERIES ============

    /// @notice Get agent info
    function getAgentInfo(
        address _agent
    ) external view returns (AgentInfo memory) {
        return agents[_agent];
    }

    /// @notice Check if an agent is verified
    function isVerified(address _agent) external view returns (bool) {
        return agents[_agent].isVerified;
    }

    /// @notice Get the model type for an agent
    function getAgentModel(address _agent) external view returns (string memory) {
        return agents[_agent].modelName;
    }

    /// @notice Get DAO for a specific model
    function getModelDAO(string memory _modelName) external view returns (address) {
        ModelType modelType = modelNameToType[_modelName];
        return modelDAOs[modelType];
    }

    /// @notice Get model type enum as string
    function modelTypeToString(ModelType _type) external pure returns (string memory) {
        if (_type == ModelType.CLAUDE) return "CLAUDE";
        if (_type == ModelType.OPENAI) return "OPENAI";
        if (_type == ModelType.GEMINI) return "GEMINI";
        if (_type == ModelType.GROK) return "GROK";
        if (_type == ModelType.MINIMAX) return "MINIMAX";
        if (_type == ModelType.DEEPSEEK) return "DEEPSEEK";
        if (_type == ModelType.LLAMA) return "LLAMA";
        if (_type == ModelType.MISTRAL) return "MISTRAL";
        if (_type == ModelType.COMMAND) return "COMMAND";
        if (_type == ModelType.PHI) return "PHI";
        if (_type == ModelType.OLYMPUS) return "OLYMPUS";
        if (_type == ModelType.AJAX) return "AJAX";
        if (_type == ModelType.NOVA) return "NOVA";
        if (_type == ModelType.STABILITY) return "STABILITY";
        if (_type == ModelType.JASPER) return "JASPER";
        if (_type == ModelType.PALM) return "PALM";
        if (_type == ModelType.ANTHROPIC) return "ANTHROPIC";
        return "UNKNOWN";
    }

    /// @notice Get all supported model names
    function getSupportedModels() external pure returns (string[] memory) {
        string[] memory models = new string[](16);
        models[0] = "CLAUDE";
        models[1] = "OPENAI";
        models[2] = "GEMINI";
        models[3] = "GROK";
        models[4] = "MINIMAX";
        models[5] = "DEEPSEEK";
        models[6] = "LLAMA";
        models[7] = "MISTRAL";
        models[8] = "COMMAND";
        models[9] = "PHI";
        models[10] = "OLYMPUS";
        models[11] = "AJAX";
        models[12] = "NOVA";
        models[13] = "STABILITY";
        models[14] = "JASPER";
        models[15] = "PALM";
        return models;
    }

    // ============ x402 PAYMENT RECEIVER ============

    /// @notice Receive payments for x402 protocol
    receive() external payable {
        // Accept payments
    }

    /// @notice Withdraw collected fees
    function withdrawFees(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "AgentVerifier: zero address");
        payable(_to).transfer(_amount);
    }
}
