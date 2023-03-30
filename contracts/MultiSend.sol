// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity ^0.8.0;

contract MultiSend is ReentrancyGuard {
    struct EtherSend {
        address receiver;
        uint256 amount;
    }

    struct ERC20Send {
        address token;
        address receiver;
        uint256 amount;
    }

    function etherMultiSend(
        EtherSend[] calldata etherSend
    ) public payable nonReentrant {
        uint256 totalAmount;
        for (uint256 i; i < etherSend.length; i++) {
            EtherSend memory local = etherSend[i];
            require(local.receiver != address(0), "Invalid Address");
            totalAmount += local.amount;
        }

        require(totalAmount == msg.value, "Invalid Amount");

        uint256 totalRefund;
        for (uint256 i; i < etherSend.length; i++) {
            EtherSend memory local = etherSend[i];
            (bool sent, ) = local.receiver.call{value: local.amount}("");
            if (!sent) totalRefund += local.amount;
        }

        if (totalRefund > 0) {
            (bool sent, ) = msg.sender.call{value: totalRefund}("");
            if (!sent) revert("MultiSend Failure");
        }
    }

    function ERC20MultiSend(
        ERC20Send[] calldata erc20Send
    ) public nonReentrant {
        for (uint256 i; i < erc20Send.length; i++) {
            ERC20Send memory local = erc20Send[i];
            IERC20(local.token).transferFrom(
                msg.sender,
                local.receiver,
                local.amount
            );
        }
    }
}
