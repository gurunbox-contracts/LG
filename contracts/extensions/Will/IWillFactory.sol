// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IOracle} from '../../IOracle.sol';

interface IWillFactory is IOracle {
    event WillCreated(address owner, address receiver, address will, uint256 willId);

    function getWills(uint256 willId) external view returns (address will);
    function willNumber() external view returns (uint256);
    function getReceivers(uint256 willId) external view returns (address);

    function createWill(address receiver) external returns (address will);
}