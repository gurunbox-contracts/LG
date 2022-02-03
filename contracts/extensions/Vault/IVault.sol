// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IVault {
    event TransferETH(address indexed from, address indexed to, uint value);
    event TransferReceiver(address indexed preReceiver, address indexed newReceiver);
    event Requested(uint requestedTime);

    function vaultFactory() external view returns (address);
    function receiver() external view returns (address);
    function vaultId() external view returns (uint);
    function requestedTime() external view returns (uint);
    function gracePeriod() external view returns (uint);
    function oracle() external view returns (address);

    function initialize(address _owner, address _receiver, uint _vaultId) external;
    function depositETH() external payable;
    function deposit20(address token, uint amount) external;
    function deposit721(address token, uint tokenId) external;
    function withdrawETH(address payable to, uint _value) external;
    function withdraw20(address token, address to, uint amount) external;
    function withdraw721(address token, address to, uint tokenId) external;
    function changeOracle(address _oracle) external;
    function changeGracePeriod(uint _gracePeriod) external;
    function changeReceiver(address _receiver) external;
    function request() external;
    function claimETH(address payable to) external;
    function claim20(address token, address to) external;
    function claim721(address token, address to, uint tokenId) external;
}