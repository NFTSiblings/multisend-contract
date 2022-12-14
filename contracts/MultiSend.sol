// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity ^0.8.0;

contract multiSend {

    struct EtherSend {
        address receiver;
        uint256 amount;
    }
    
    struct ERC20Send {
        address token;
        address receiver;
        uint256 amount;
    }

    function etherMultiSend(EtherSend[] calldata etherSend) public payable {
        uint256 totalAmount;
        for (uint256 i = 0; i < etherSend.length; i++) {
            EtherSend memory local = etherSend[i];
            require(local.receiver != address(0), "Invalid Address");
            totalAmount += local.amount;
        }

        require(totalAmount == msg.value, "Invalid Amount");

        uint256 totalRefund;
        for (uint256 i = 0; i < etherSend.length; i++) {
            (bool sent, ) = etherSend[i].receiver.call{value: etherSend[i].amount}("");
            if(!sent) {
                totalRefund += etherSend[i].amount;
            }
        }

        if(totalRefund > 0) {
            (bool sent, ) = msg.sender.call{value: totalRefund}("");
            if(!sent){
                revert("MultiSend Failure");
            }
        }
    }

    function ERC20MultiSend(ERC20Send[] calldata erc20Send) public {
        for (uint256 i = 0; i < erc20Send.length; i++){
            ERC20Send memory local = erc20Send[i];
            require(local.receiver != address(0), "Invalid Address");
            require(local.amount >= IERC20(local.token).allowance(msg.sender, address(this)), "Invalid Allowance");
            IERC20(local.token).transferFrom(msg.sender, local.receiver, local.amount);
        }
    }
}