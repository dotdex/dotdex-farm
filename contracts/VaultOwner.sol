pragma solidity ^0.8.0;

import "./DotDexVault.sol";

contract VaultOwner is Ownable {
    using SafeBEP20 for IBEP20;

    DotDexVault public immutable dotDexVault;

    /**
     * @notice Constructor
     * @param _dotDexVaultAddress: DotDexVault contract address
     */
    constructor(address _dotDexVaultAddress) public {
        dotDexVault = DotDexVault(_dotDexVaultAddress);
    }

    /**
     * @notice Sets admin address to this address
     * @dev Only callable by the contract owner.
     * It makes the admin == owner.
     */
    function setAdmin() external onlyOwner {
        dotDexVault.setAdmin(address(this));
    }

    /**
     * @notice Sets treasury address
     * @dev Only callable by the contract owner.
     */
    function setTreasury(address _treasury) external onlyOwner {
        dotDexVault.setTreasury(_treasury);
    }

    /**
     * @notice Sets performance fee
     * @dev Only callable by the contract owner.
     */
    function setPerformanceFee(uint256 _performanceFee) external onlyOwner {
        dotDexVault.setPerformanceFee(_performanceFee);
    }

    /**
     * @notice Sets call fee
     * @dev Only callable by the contract owner.
     */
    function setCallFee(uint256 _callFee) external onlyOwner {
        dotDexVault.setCallFee(_callFee);
    }

    /**
     * @notice Sets withdraw fee
     * @dev Only callable by the contract owner.
     */
    function setWithdrawFee(uint256 _withdrawFee) external onlyOwner {
        dotDexVault.setWithdrawFee(_withdrawFee);
    }

    /**
     * @notice Sets withdraw fee period
     * @dev Only callable by the contract owner.
     */
    function setWithdrawFeePeriod(uint256 _withdrawFeePeriod)
        external
        onlyOwner
    {
        dotDexVault.setWithdrawFeePeriod(_withdrawFeePeriod);
    }

    /**
     * @notice Withdraw unexpected tokens sent to the DotDex Vault
     */
    function inCaseTokensGetStuck(address _token) external onlyOwner {
        dotDexVault.inCaseTokensGetStuck(_token);
        uint256 amount = IBEP20(_token).balanceOf(address(this));
        IBEP20(_token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Triggers stopped state
     * @dev Only possible when contract not paused.
     */
    function pause() external onlyOwner {
        dotDexVault.pause();
    }

    /**
     * @notice Returns to normal state
     * @dev Only possible when contract is paused.
     */
    function unpause() external onlyOwner {
        dotDexVault.unpause();
    }
}
