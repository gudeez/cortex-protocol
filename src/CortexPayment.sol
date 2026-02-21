// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CortexPayment - x402 payment receiver for Cortex Protocol
/// @notice Handles micropayments for agent access using x402 protocol
/// @dev Implements HTTP 402 Payment header standard
contract CortexPayment is Ownable, ReentrancyGuard {
    /// @notice Price per month for DAO access (in native token)
    uint256 public monthlySubscriptionPrice = 0.001 ether;

    /// @notice Price per API call (in native token)
    uint256 public perCallPrice = 0.00001 ether; // 0.01 gwei

    /// @notice Treasury address
    address public treasury;

    /// @notice Used payment amounts (for replay protection)
    mapping(bytes32 => bool) public usedPayments;

    /// @notice Subscriptions per user
    struct Subscription {
        uint256 expiresAt;
        uint256 callsRemaining;
    }

    /// @notice Active subscriptions
    mapping(address => Subscription) public subscriptions;

    /// @notice Events
    event SubscriptionPurchased(
        address indexed user,
        uint256 months,
        uint256 expiresAt,
        uint256 price
    );
    event APICallPaid(address indexed user, uint256 price);
    event PriceUpdated(string priceType, uint256 newPrice);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FundsWithdrawn(address indexed to, uint256 amount);

    /// @param _owner Contract owner
    /// @param _treasury Treasury address
    constructor(address _owner, address _treasury) Ownable(_owner) {
        require(_treasury != address(0), "CortexPayment: zero treasury");
        treasury = _treasury;
    }

    // ============ x402 PAYMENT HANDLING ============

    /// @notice Handle x402 payment header
    /// @dev Standard x402: caller sends payment with calldata encoding payment info
    /// @param _paymentData Encoded payment details (see x402 spec)
    function _receivePayment(
        bytes calldata _paymentData
    ) internal returns (uint256 amount) {
        // Parse x402 payment data
        // Format: abi.encode(amount, payload)
        (uint256 paymentAmount, ) = abi.decode(_paymentData, (uint256, bytes));

        return paymentAmount;
    }

    /// @notice Receive payment (called by x402-compatible clients)
    receive() external payable {
        // Accept direct payments as donations/tips
    }

    // ============ SUBSCRIPTIONS ============

    /// @notice Purchase subscription
    function purchaseSubscription(uint256 _months) external payable nonReentrant {
        uint256 totalPrice = monthlySubscriptionPrice * _months;
        require(msg.value >= totalPrice, "CortexPayment: insufficient payment");

        uint256 duration = _months * 30 days;
        uint256 newExpiresAt = block.timestamp + duration;

        // Extend or create subscription
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.expiresAt > block.timestamp) {
            sub.expiresAt += duration;
        } else {
            sub.expiresAt = newExpiresAt;
        }

        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit SubscriptionPurchased(msg.sender, _months, sub.expiresAt, totalPrice);
    }

    /// @notice Check if user has active subscription
    function hasActiveSubscription(address _user) external view returns (bool) {
        return subscriptions[_user].expiresAt > block.timestamp;
    }

    /// @notice Get subscription expiry
    function getSubscriptionExpiry(address _user) external view returns (uint256) {
        return subscriptions[_user].expiresAt;
    }

    // ============ PER-CALL PAYMENTS ============

    /// @notice Pay per API call (x402 style)
    function payForCall() external payable nonReentrant {
        require(msg.value >= perCallPrice, "CortexPayment: insufficient call price");

        // Generate unique payment ID for replay protection
        bytes32 paymentId = keccak256(
            abi.encode(msg.sender, block.number, msg.value)
        );
        require(!usedPayments[paymentId], "CortexPayment: payment used");
        usedPayments[paymentId] = true;

        // Refund excess
        if (msg.value > perCallPrice) {
            payable(msg.sender).transfer(msg.value - perCallPrice);
        }

        emit APICallPaid(msg.sender, perCallPrice);
    }

    // ============ ADMIN ============

    function setMonthlySubscriptionPrice(uint256 _price) external onlyOwner {
        monthlySubscriptionPrice = _price;
        emit PriceUpdated("monthly", _price);
    }

    function setPerCallPrice(uint256 _price) external onlyOwner {
        perCallPrice = _price;
        emit PriceUpdated("perCall", _price);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "CortexPayment: zero treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    function withdrawFunds(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "CortexPayment: zero address");
        payable(_to).transfer(_amount);
        emit FundsWithdrawn(_to, _amount);
    }
}
