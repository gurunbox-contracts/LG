// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IOracle} from '../../IOracle.sol';

interface IVaultFactory is IOracle {
    event VaultCreated(address owner, address receiver, address vault);

    function getVaults(uint vaultId) external view returns (address vault);
    function vaultNumber() external view returns (uint);
    function getReceivers(uint vaultId) external view returns (address);

    function createVault(address owner, address receiver) external returns (address vault);
}