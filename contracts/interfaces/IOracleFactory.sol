// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721 } from './IERC721.sol';

interface IOracleFactory {
    event OracleCreated(address indexed oracle, uint256 oracleId, string name, address owner);

    function getOracles(uint256 oracleId) external view returns (address);
    function createOracle(
        string memory name_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver, 
        uint256 _gracePeriod
    ) external returns (address oracle);
}