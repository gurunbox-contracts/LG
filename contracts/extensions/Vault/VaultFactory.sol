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

    function _createVault(address _owner, address _receiver) internal returns (address _vault) {
        require(_owner != address(0), 'VaultFactory: OWNER_ZERO_ADDRESS');
        require(_receiver != address(0), 'VaultFactory: RECEIVER_ZERO_ADDRESS');
        
        bytes memory bytecode = type(Vault).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_owner, _receiver, block.timestamp));
        _vault = Create2.deploy(0, salt, bytecode);

        IVault(_vault).initialize(_owner, _receiver);

        getVaults[nextVaultId] = _vault;
        nextVaultId++;
        

        emit VaultCreated(_owner, _receiver, _vault, nextVaultId - 1);
    }

    function createVault(address _owner, address receiver) external override onlyOwner returns (address vault) {
        vault = _createVault(_owner, receiver);
    } 

}