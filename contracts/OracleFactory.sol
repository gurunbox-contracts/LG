// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IOracleFactory } from './interfaces/IOracleFactory.sol';
import { IOracle } from './interfaces/IOracle.sol'; 
import { Oracle } from './Oracle.sol';
import { Create2 } from './@OpenZeppelin/contracts/utils/Create2.sol';

contract OracleFactory is IOracleFactory {
    uint256 private nextOracleId;
    mapping(uint256 => address) public override getOracles;

    function createOracle(
        string memory name_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver
    ) external override returns (address oracle) {
        bytes memory bytecode = type(Oracle).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(name_, _owner));
        oracle = Create2.deploy(0, salt, bytecode);

        IOracle(oracle).initialize(name_, _owner, _trustees, _numerator, _receiver);
        getOracles[nextOracleId] = oracle;
        nextOracleId++;

        emit OracleCreated(oracle, nextOracleId - 1, name_, _owner);
    }
}