// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IWill {
    event TransferETH(address indexed from, address indexed to, uint256 value);
    event TransferReceiver(address indexed preReceiver, address indexed newReceiver);
    event Requested(uint256 requestedTime);

    function willFactory() external view returns (address);
    function receiver() external view returns (address);
    function oracle() external view returns (address);
    function willId() external view returns (uint256);
    function gracePeriod() external view returns (uint256);
    function requestedTime() external view returns (uint256);

    function initialize(address _owner, address _receiver, uint256 _willId) external;
    function depositETH() external payable;
    function withdrawETH(address payable to, uint256 value) external;
    function changeOracle(address _oracle) external;
    function changeGracePeriod(uint256 _gracePeriod) external;
    function changeReceiver(address _receiver) external;
    function claimETH(address payable to, uint256 value) external;
    function claim20(address[] calldata tokens, address to, uint256 amount) external;
    function claim721(address token, address to, uint256 tokenId) external;
}