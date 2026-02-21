// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/// @title CortexToken - Governance token for a specific AI model DAO
/// @notice ERC-20 with voting capabilities for Cortex DAO governance
contract CortexToken is ERC20, ERC20Permit, ERC20Votes {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1B tokens

    /// @notice Emitted when the DAO address is set
    event DAOConfigured(address indexed dao);

    /// @notice The governance DAO that can mint tokens
    address public dao;

    /// @notice Restrict minting to only the DAO
    modifier onlyDAO() {
        require(msg.sender == dao, "CortexToken: only DAO");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) ERC20Permit(_name) {
        // Token supply starts at 0 - minted by DAO as needed
    }

    /// @notice Set the DAO address (called once by factory)
    function setDAO(address _dao) external {
        require(dao == address(0), "CortexToken: DAO already set");
        require(_dao != address(0), "CortexToken: zero address");
        dao = _dao;
        emit DAOConfigured(_dao);
    }

    /// @notice Mint tokens (only callable by DAO)
    function mint(address to, uint256 amount) external onlyDAO {
        _mint(to, amount);
    }

    /// @notice Burn tokens (anyone can burn their own)
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
