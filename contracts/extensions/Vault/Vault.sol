// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IVault} from './IVault.sol';
import {Ownable} from '../../@OpenZeppelin/contracts/access/Ownable.sol';
import {IERC20} from '../../@OpenZeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC721} from '../../@OpenZeppelin/contracts/token/ERC721/IERC721.sol';
import {IOracle} from '../../IOracle.sol';
import {IVaultFactory} from './IVaultFactory.sol';


contract Vault is IVault, Ownable{
    address public override vaultFactory;
    address public override receiver;
    address public override oracle;
    uint public override vaultId; 
    uint public override requestedTime;
    uint public override gracePeriod;
    

    constructor() {
        vaultFactory = msg.sender;
    }

    function condition() public view returns (bool) {
        return IOracle(oracle).condition();
    }
    
    // called once by the factory at time of deployment
    function initialize(address _owner, address _receiver, uint _vaultId) external override {
        require(msg.sender == vaultFactory, 'Vault: FORBIDDEN'); // sufficient check
        transferOwnership(_owner);
        receiver = _receiver;
        oracle = msg.sender;
        vaultId = _vaultId;

        emit TransferReceiver(address(0), receiver);
    }

    // It is not neccessarily important to use deposit function
    function depositETH() external override payable onlyOwner {
        emit TransferETH(msg.sender, address(this), msg.value);
    }

    function deposit20(address token, uint amount) external override onlyOwner {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function deposit721(address token, uint tokenId) external override onlyOwner {
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);
    }

    function withdrawETH(address payable to, uint _value) external override onlyOwner {
        require(address(this).balance >= _value, "Vault: Insufficient value");

        // To can receive Ether since the address of to is payable
        (bool success, ) = to.call{value: _value}("");
        require(success, "Failed to send Ether");

        emit TransferETH(address(this), to, _value);
    }

    function withdraw20(address token, address to, uint amount) external override onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    function withdraw721(address token, address to, uint tokenId) external override onlyOwner {
        IERC721(token).transferFrom(address(this), to, tokenId);
    }

    function changeOracle(address _oracle) external override onlyOwner {
        oracle = _oracle;
    }

    function changeGracePeriod(uint _gracePeriod) external override onlyOwner {
        gracePeriod = _gracePeriod;
    }

    function changeReceiver(address _receiver) external override onlyOwner {
        address preReceiver = receiver;
        receiver = _receiver;

        emit TransferReceiver(preReceiver, receiver);
    }

    function request() external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        requestedTime = block.timestamp;
        
        emit Requested(requestedTime);
    }

    function claimETH(address payable to) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault: Grace period not over");

        // To receive Ether since the address of To is payable
        uint _value = address(this).balance;
        (bool success, ) = to.call{value: _value}("");
        require(success, "Failed to send Ether");

        emit TransferETH(address(this), to, _value);
    }

    function claim20(address token, address to) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault: Grace period not over");

        uint _value = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(to, _value);
    }

    function claim721(address token, address to, uint tokenId) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault: Grace period not over");

        IERC721(token).transferFrom(address(this), to, tokenId);
    }

}