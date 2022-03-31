// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IOracleFactory {
    event OracleCreated(address indexed oracle, uint256 oracleId, string name, address owner);

    function getOracle(uint256 oracleId) external view returns (address);
    function getOracleId(address oracle) external view returns (uint256);

    function setTokenURI(string memory uri) external;
    function mint(address to, uint256 oracleId) external returns(uint256 tokenId);
    function burn(uint256 tokenId, uint256 oracleId) external;

    function createOracle(
        string memory name_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver, 
        uint256 _gracePeriod
    ) external returns (address oracle);
}