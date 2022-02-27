// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IWill } from "./IWill.sol";
import { Ownable } from '../../@OpenZeppelin/contracts/access/Ownable.sol';
import { IERC20 } from '../../@OpenZeppelin/contracts/token/ERC20/IERC20.sol';
import { IERC721 } from '../../@OpenZeppelin/contracts/token/ERC721/IERC721.sol';
import { IOracle } from '../../IOracle.sol';
import { IWillFactory } from './IWillFactory.sol';

contract Will is IWill, Ownable {
    address public override willFactory;
    address public override receiver;
    address public override oracle;
    uint256 public override willId; 

    constructor() {
        willFactory = msg.sender;
    }

    function initialize(address _owner, address _receiver, uint256 _willId) external override {
        require(msg.sender == willFactory, "Will: FORBIDDEN");
        transferOwnership(_owner);
        receiver = _receiver;
        oracle = msg.sender;
        willId = _willId;

        emit TransferReceiver(address(0), receiver);
    }

}