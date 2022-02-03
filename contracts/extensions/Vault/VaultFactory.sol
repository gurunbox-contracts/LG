// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Oracle} from '../../Oracle.sol';
import {IVaultFactory} from './IVaultFactory.sol';
import {Vault} from './Vault.sol';
import {Create2} from "../../@OpenZeppelin/contracts/utils/Create2.sol";
import {IVault} from './IVault.sol';

contract VaultFactory is Oracle, IVaultFactory {
    uint private nextVaultId = 0;

    mapping(uint => address) public override getVaults;

    constructor(
        string memory name_,
        address _owner
        ) Oracle(name_, _owner) {
    }

    function vaultNumber() public view override returns (uint) {
        return nextVaultId;
    }

    function getReceivers(uint vaultId) public view override returns (address) {
        return IVault(getVaults[vaultId]).receiver();
    }

    function createVault(address receiver) external override onlyOwner returns (address vault) {
        require(receiver != address(0), 'VaultFactory: RECEIVER_ZERO_ADDRESS');
        
        bytes memory bytecode = type(Vault).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(owner(), receiver, block.timestamp));
        vault = Create2.deploy(0, salt, bytecode);

        IVault(vault).initialize(owner(), receiver, nextVaultId);

        getVaults[nextVaultId] = vault;
        nextVaultId++;
        
        emit VaultCreated(owner(), receiver, vault, nextVaultId - 1);
    } 

}