// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IVault {
    event TransferETH(address indexed from, address indexed to, uint value);
    event TransferReceiver(address indexed previousReceiver, address indexed newReceiver);

    function vaultFactory() external view returns (address);
    function receiver() external view returns (address);

    function initialize(address _owner, address _receiver) external;
    function changeReceiver(address _receiver) external;
    function claimETH(address payable to) external;
    function craim20(address token, address to) external;
    function claim721(address token, address to, uint tokenId) external;
}