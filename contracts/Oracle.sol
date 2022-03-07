// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IOracle} from "./IOracle.sol";
import {Ownable} from './@OpenZeppelin/contracts/access/Ownable.sol';

contract Oracle is IOracle, Ownable {
    string private _name;

    address[] public override trustees;
    uint256 public override numerator = 1;
    uint256 public override denominator = 1;
    uint256 public override conditionCounter;
    
    mapping(address => uint256[]) private trusteeIds;
    mapping(uint256 => bool) public override trusteeOpinion;

    constructor(string memory name_, address _owner) {
        _name = name_;
        transferOwnership(_owner);
    }

    function condition() external view override returns (bool) {
        return conditionCounter >= numerator ? true : false;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function getTrusteeIds(address _trustee) public view override returns (uint[] memory) {
        return trusteeIds[_trustee];
    }

    function setTrustees(address[] memory _trustees, uint256 _numerator) external virtual override onlyOwner {
        trustees = _trustees;

        require(_numerator <= trustees.length, "Oracle: Numerator must be less than or equal to denominator");
        numerator = _numerator;
        denominator = trustees.length;

        for (uint256 i = 0; i < trustees.length; i++) {
            trusteeIds[trustees[i]].push(i);
        }
    }

    function judge(bool TF, uint256 trusteeId) external virtual override {
        require(trustees[trusteeId] == msg.sender, "Oracle: Not a trustee");
        require(trusteeOpinion[trusteeId] != TF, "Oracle: The opinion you're trying to send has already been sent");

        TF ? conditionCounter++ : conditionCounter--;
        trusteeOpinion[trusteeId] = TF;
        
        emit Judged(trustees[trusteeId], TF);
    }
}
