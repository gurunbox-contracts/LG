// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IWill } from "./IWill.sol";
import { Ownable } from '../../@OpenZeppelin/contracts/access/Ownable.sol';
import { IERC20 } from '../../@OpenZeppelin/contracts/token/ERC20/IERC20.sol';
import { IERC721 } from '../../@OpenZeppelin/contracts/token/ERC721/IERC721.sol';
import { IOracle } from '../../IOracle.sol';
import { IWillFactory } from './IWillFactory.sol';

contract Will is IWill, Ownable {
    address public override willFactory;
    address public override receiver;
    address public override oracle;
    uint256 public override willId; 
    uint256 public override gracePeriod;
    uint256 public override requestedTime;

    constructor() {
        willFactory = msg.sender;
    }

    function condition() public view returns (bool) {
        return IOracle(oracle).condition();
    }

    function initialize(address _owner, address _receiver, uint256 _willId) external override {
        require(msg.sender == willFactory, "Will: FORBIDDEN");
        transferOwnership(_owner);
        receiver = _receiver;
        oracle = msg.sender;
        willId = _willId;

        emit TransferReceiver(address(0), receiver);
    }

    // It is not neccessarily important to use deposit function
    function depositETH() external override payable onlyOwner {
        emit TransferETH(msg.sender, address(this), msg.value);
    }

    function withdrawETH(address payable to, uint256 value) external override onlyOwner {
        require(address(this).balance >= value, "Vault: Insufficient value");

        // To can receive Ether since the address of to is payable
        (bool success, ) = to.call{value: value}("");
        require(success, "Failed to send Ether");

        emit TransferETH(address(this), to, value);
    }

    function changeOracle(address _oracle) external override onlyOwner {
        oracle = _oracle;
    }

    function changeGracePeriod(uint256 _gracePeriod) external override onlyOwner {
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

    function claimETH(address payable to, uint256 value) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault: Grace period not over");

        // To receive Ether since the address of To is payable
        (bool success, ) = to.call{value: value}("");
        require(success, "Failed to send Ether");

        emit TransferETH(address(this), to, value);
    }

    function claim20(address token, address to, uint256 amount) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault:Grace period not over");

        IERC20(token).transferFrom(owner(), to, amount);
    }

    function claim721(address token, address to, uint256 tokenId) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= requestedTime + gracePeriod, "Vault: Grace period not over");

        IERC721(token).transferFrom(owner(), to, tokenId);
    }
}