// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IWill } from "./interfaces/IWill.sol";
import { IERC20 } from './interfaces/IERC20.sol';
import { IERC721 } from './interfaces/IERC721.sol';
import { IOracle } from './interfaces/IOracle.sol';
import { Ownable } from './utils/Ownable.sol';

contract Will is IWill, Ownable {
    address public override receiver;
    address public override oracle;
    uint256 public override willId; 
    uint256 public override gracePeriod;

    constructor() {
        oracle = msg.sender;
    }

    function condition() public view returns (bool) {
        return IOracle(oracle).condition();
    }

    // called once by the oracle factory at time of deployment
    function initialize(address _owner, address _receiver, uint256 _willId, uint256 _gracePeriod) external override {
        require(msg.sender == oracle, "Will: FORBIDDEN");
        transferOwnership(_owner);
        receiver = _receiver;
        oracle = msg.sender;
        willId = _willId;
        gracePeriod = _gracePeriod;

        emit TransferReceiver(address(0), receiver);
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

    function claim20(address[] calldata tokens, address to, uint256[] calldata amounts) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= IOracle(oracle).fulfillmentTime() + gracePeriod, "Vault:Grace period not over");

        for (uint i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).transferFrom(owner(), to, amounts[i]);
        }
    }

    function claim721(address token, address to, uint256 tokenId) external override {
        require(receiver == msg.sender, "Vault: Not receiver");
        require(condition(), "Vault: Condition not met");
        require(block.timestamp >= IOracle(oracle).fulfillmentTime() + gracePeriod, "Vault: Grace period not over");

        IERC721(token).transferFrom(owner(), to, tokenId);
    }
}