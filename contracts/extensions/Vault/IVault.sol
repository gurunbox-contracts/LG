// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IVault {
    event TransferETH(address indexed from, address indexed to, uint value);
    event TransferReceiver(address indexed previousReceiver, address indexed newReceiver);
    event Requested(uint requestedTime);

    function vaultFactory() external view returns (address);
    function receiver() external view returns (address);
    function requestedTime() external view returns (uint);
    function gracePeriod() external view returns (uint);

    function initialize(address _owner, address _receiver) external;
    function changeReceiver(address _receiver) external;
    function request() external;
    function claimETH(address payable to) external;
    function craim20(address token, address to) external;
    function claim721(address token, address to, uint tokenId) external;
}