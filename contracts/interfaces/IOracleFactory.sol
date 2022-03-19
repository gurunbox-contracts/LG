// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IOracleFactory {
    event OracleCreated(address indexed oracle, uint256 oracleId, string name, address owner);
    function getOracles(uint256 oracleId) external view returns (address);
    function createOracle(
        string memory name_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver
    ) external returns (address oracle);
}