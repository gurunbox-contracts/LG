// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Oracle } from '../../Oracle.sol';
import { IWillFactory } from './IWillFactory.sol';
import { Will } from './Will.sol';
import { Create2 } from '../../@OpenZeppelin/contracts/utils/Create2.sol';
import { IWill } from './IWill.sol';

contract WillFactory is Oracle, IWillFactory {
    uint256 private nextWillId = 0;

    mapping(uint256 => address) public override getWills;

    constructor(
        string memory name_,
        address _owner
        ) Oracle(name_, _owner) {
    }

    function willNumber() public view override returns (uint256) {
        return nextWillId;
    }

    // function getReceivers(uint256 willId) public view override returns (address) {
    //     return IWill(getWills[willId]).receiver();
    // }

    function createWill(address receiver) external override onlyOwner returns (address will) {
        require(receiver != address(0), 'WillFactory: RECEIVER_ZERO_ADDRESS');
        
        bytes memory bytecode = type(Will).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(owner(), receiver, nextWillId));
        will = Create2.deploy(0, salt, bytecode);

        IWill(will).initialize(owner(), receiver, nextWillId);

        getWills[nextWillId] = will;
        nextWillId++;
        
        emit WillCreated(owner(), receiver, will, nextWillId - 1);
    } 

    

}