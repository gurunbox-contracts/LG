// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IOracle {
    event Judged(address trustee, bool TF);
    event WillCreated(address owner, address receiver, address will, uint256 willId);

    function oracleFactory() external view returns (address);
    function trustees(uint256) external view returns (address);
    function numerator() external view returns (uint256);
    function conditionCounter() external view returns (uint256);
    function fulfillmentTime() external view returns (uint256);
    function getWills(uint256 willId) external view returns (address will);
    function trusteeOpinion(uint256 trusteeId) external view returns (bool);

    function condition() external view returns (bool);
    function name() external view returns (string memory);
    function trusteesLength() external view returns (uint256);
    function willNumber() external view returns (uint256);
    function getReceivers(uint256 willId) external view returns (address);
    
    function initialize(
        string memory name_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver, 
        uint256 _gracePeriod
    ) external;
    function setTrustees(address[] memory _trustees, uint256 _numerator) external;
    function judge(bool TF, uint256 trusteeId) external;
    function createWill(address receiver, uint256 _gracePeriod) external returns (address will);
}