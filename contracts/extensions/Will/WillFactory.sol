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
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address receiver
        ) Oracle(name_, _owner, _trustees, _numerator) {
            _createWill(receiver);
    }

    function willNumber() public view override returns (uint256) {
        return nextWillId;
    }

    function getReceivers(uint256 willId) public view override returns (address) {
        return IWill(getWills[willId]).receiver();
    }

    function createWill(address receiver) external override onlyOwner returns (address will) {
        will = _createWill(receiver);
    }

    function _createWill(address _receiver) internal returns (address _will) {
        require(_receiver != address(0), 'WillFactory: RECEIVER_ZERO_ADDRESS');
        
        bytes memory bytecode = type(Will).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(owner(), _receiver, nextWillId));
        _will = Create2.deploy(0, salt, bytecode);

        IWill(_will).initialize(owner(), _receiver, nextWillId);

        getWills[nextWillId] = _will;
        nextWillId++;
        
        emit WillCreated(owner(), _receiver, _will, nextWillId - 1);
    }

}