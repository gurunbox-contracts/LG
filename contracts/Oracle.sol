// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IOracle } from "./interfaces/IOracle.sol";
import { IWill } from './interfaces/IWill.sol';
import { Will } from './Will.sol';
import { Ownable } from './@OpenZeppelin/contracts/access/Ownable.sol';
import { Create2 } from './@OpenZeppelin/contracts/utils/Create2.sol';

contract Oracle is IOracle, Ownable {
    string private _proposition;
    uint256 private nextWillId = 0;
    address[] private ZERO_ARRAY = new address[](0);
    
    address public override oracleFactory;
    address[] public override trustees;
    uint256 public override numerator;
    uint256 public override conditionCounter;
    uint256 public override fulfillmentTime;
    
    mapping(uint256 => address) public override getWills;
    mapping(uint256 => bool) public override trusteeOpinion;
    
    constructor() {
        oracleFactory = msg.sender;
    }

    // called once by the oracle factory at time of deployment
    function initialize(
        string memory proposition_, 
        address _owner, 
        address[] memory _trustees, 
        uint256 _numerator,
        address _receiver, 
        uint256 _gracePeriod
    ) external override {
        require(msg.sender == oracleFactory, "Will: FORBIDDEN");
        _proposition = proposition_;
        transferOwnership(_owner);
        trustees = _trustees;
        numerator = _numerator;

        _createWill(_receiver, _gracePeriod);
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

    function willNumber() public view override returns (uint256) {
        return nextWillId;
    }

    function getReceivers(uint256 willId) public view override returns (address) {
        return IWill(getWills[willId]).receiver();
    }

    function setTrustees(address[] memory newTrustees, uint256 _numerator) external virtual override onlyOwner {
        require(_numerator <= newTrustees.length, "Oracle: Numerator must be less than or equal to denominator");
        trustees = newTrustees;
        numerator = _numerator;
    }

    /** 
     * @dev only trustees can judge. It is only when the condition is met just from false to true that block.timestamp will be recorded.
     * @param TF is the boolean value of the judgement by each trustee.
     * @param trusteeId is the index of the trustee in the array of trustees.
     */
    function judge(bool TF, uint256 trusteeId) external virtual override {
        require(trustees[trusteeId] == msg.sender, "Oracle: Not a trustee");
        require(trusteeOpinion[trusteeId] != TF, "Oracle: The opinion you're trying to send has already been sent");

        TF ? conditionCounter++ : conditionCounter--;
        trusteeOpinion[trusteeId] = TF;

        if (conditionCounter == numerator && TF) {
            fulfillmentTime = block.timestamp;
        }
        
        emit Judged(trustees[trusteeId], TF);
    }
    
    function createWill(address receiver, uint256 _gracePeriod) external override onlyOwner returns (address will) {
        will = _createWill(receiver, _gracePeriod);
    }

    function _createWill(address _receiver, uint256 _gracePeriod) internal returns (address _will) {
        require(_receiver != address(0), 'WillFactory: RECEIVER_ZERO_ADDRESS');
        
        bytes memory bytecode = type(Will).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(owner(), _receiver, nextWillId));
        _will = Create2.deploy(0, salt, bytecode);

        IWill(_will).initialize(owner(), _receiver, nextWillId, _gracePeriod);

        getWills[nextWillId] = _will;
        nextWillId++;
        
        emit WillCreated(owner(), _receiver, _will, nextWillId - 1);
    }
}
