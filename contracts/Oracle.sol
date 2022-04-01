// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IOracle } from "./interfaces/IOracle.sol";
import { Ownable } from './utils/Ownable.sol';
import { Create2 } from './utils/Create2.sol';
import { IOracleFactory } from './interfaces/IOracleFactory.sol';
import { IERC20 } from './interfaces/IERC20.sol';
import { IERC721 } from './interfaces/IERC721.sol';

contract Oracle is IOracle, Ownable {
    string private _proposition;
    uint256 private _alertTokenId;
    
    address public override oracleFactory;
    address public override receiver;
    address[] public override trustees;
    uint256 public override numerator;
    uint256 public override gracePeriod;
    uint256 public override conditionCounter;
    uint256 public override fulfillmentTime;
    
    // Mapping from trusteeId to trustee's condition
    mapping(uint256 => bool) public override trusteeOpinion;
    
    constructor() {
        oracleFactory = msg.sender;
    }

    // called once by the oracle factory at time of deployment
    function initialize(
        string memory proposition_, 
        address _owner, 
        address _receiver,
        address[] memory _trustees, 
        uint256 _numerator,
        uint256 _gracePeriod
    ) external override {
        require(msg.sender == oracleFactory, "Oracle: must be called by oracle factory");
        _proposition = proposition_;
        transferOwnership(_owner);
        receiver = _receiver;
        trustees = _trustees;
        numerator = _numerator;
        gracePeriod = _gracePeriod;
    }

    function condition() external view override returns (bool) {
        return conditionCounter >= numerator ? true : false;
    }

    function proposition() public view override returns (string memory) {
        return _proposition;
    }

    function trusteesLength() public view override returns (uint256) {
        return trustees.length;
    }

    function changeReceiver(address _receiver) external override onlyOwner {
        receiver = _receiver;
    }

    function changeTrustees(address[] memory newTrustees, uint256 _numerator) external virtual override onlyOwner {
        require(_numerator <= newTrustees.length, "Oracle: must have numerator less than or equal to denominator");
        trustees = newTrustees;
        numerator = _numerator;
    }

    function changeGracePeriod(uint256 _gracePeriod) external override onlyOwner {
        gracePeriod = _gracePeriod;
    }

    /** 
     * @dev only trustees can judge. It is only when the condition is met just from false to true that block.timestamp will be recorded.
     * @param TF is the boolean value of the judgement by each trustee.
     * @param trusteeId is the index of the trustee in the array of trustees.
     */
    function judge(bool TF, uint256 trusteeId) external virtual override {
        require(trustees[trusteeId] == msg.sender, "Oracle: must be called by trustees with correct trusteeId");
        require(trusteeOpinion[trusteeId] != TF, "Oracle: must be called with different opinion");

        TF ? conditionCounter++ : conditionCounter--;
        trusteeOpinion[trusteeId] = TF;

        uint256 _oracleId = IOracleFactory(oracleFactory).getOracleId(address(this));
        if (conditionCounter == numerator && TF) {
            fulfillmentTime = block.timestamp;

            _alertTokenId = IOracleFactory(oracleFactory).mint(owner(), _oracleId);

        } else if (conditionCounter == (numerator - 1) && !TF) {
            IOracleFactory(oracleFactory).burn(_alertTokenId, _oracleId);
        }   
        
        emit Judged(trustees[trusteeId], TF);
    }

    function claim20(address[] calldata tokens, address to, uint256[] calldata amounts) external override {
        require(tokens.length == amounts.length, "Oracle: must have same length of tokens and amounts");
        require(receiver == msg.sender, "Oracle: must be called by receiver");
        require(conditionCounter >= numerator, "Oracle: must be called after Condition is fulfilled");
        require(block.timestamp >= fulfillmentTime + gracePeriod, "Oracle: must be called after grace period has passed");

        for (uint i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).transferFrom(owner(), to, amounts[i]);
        }
    }

    function claim721(address[] calldata tokens, address to, uint256[] calldata tokenIds) external override {
        require(tokens.length == tokenIds.length, "Oracle: must have same length of tokens and tokenIds");
        require(receiver == msg.sender, "Oracle: must be called by receiver");
        require(conditionCounter >= numerator, "Oracle: must be called after Condition is fulfilled");
        require(block.timestamp >= fulfillmentTime + gracePeriod, "Oracle: must be called after grace period has passed");

        for (uint i = 0; i < tokens.length; i++) {
            IERC721(tokens[i]).transferFrom(owner(), to, tokenIds[i]);
        }
    }
}
