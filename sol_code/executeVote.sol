// SPDX-License-Identifier: MIT
pragma solidity 0.6.1;

import "./voteProposal.sol";
import "./transaction.sol";

contract VoteOption {
    uint256 public price;
    bool public executed;
    RealEstateToken public transactionContract;

    constructor (uint256 _price) public {
        price = _price;
    }

    function setTransactionContract(address _transactionContract) external {
        transactionContract = RealEstateToken(_transactionContract);
    }

    function setPrice(uint256 _newPrice) public {
        price = _newPrice;
    }

    function updatePrice() external {
        require(!executed, "Already executed");
        require(address(transactionContract) != address(0), "Transaction contract not set");
        transactionContract.UpdatePrices(price);
        executed = true;
    }
}