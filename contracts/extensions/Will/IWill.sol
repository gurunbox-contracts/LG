// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IWill {
    event TransferReceiver(address indexed preReceiver, address indexed newReceiver);

    function willFactory() external view returns (address);
    function receiver() external view returns (address);
    function oracle() external view returns (address);
    function willId() external view returns (uint256);

    function initialize(address _owner, address _receiver, uint256 _willId) external;

}