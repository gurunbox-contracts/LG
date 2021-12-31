// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IOracle} from "./IOracle.sol";
import {Ownable} from './@OpenZeppelin/contracts/access/Ownable.sol';
import {Create2} from "./@OpenZeppelin/contracts/utils/Create2.sol";
import {Vault} from "./extensions/Vault/Vault.sol";

contract Oracle is IOracle, Ownable {
    string private _name;

    uint public override conditionCounter;
    address[] public override trustees;
    uint public override numerator = 1;
    uint public override denominator = 1;
    
    mapping(address => uint[]) private trusteeIds;
    mapping(uint => bool) public override trusteeOpinion;

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

    function setTrustees(address[] memory _trustees, uint _numerator) public onlyOwner {
        require(_numerator <= trustees.length, "Vault: Numerator must be less than or equal to denominator");
        trustees = _trustees;
        numerator = _numerator;
        denominator = trustees.length;

        for (uint i = 0; i < trustees.length; i++) {
            trusteeIds[trustees[i]].push(i);
        }
    }

    function judge(bool TF, uint trusteeId) external override returns (uint) {
        require(trustees[trusteeId] == msg.sender, "Vault: Not a trustee.");

        if (TF) {
            if(trusteeOpinion[trusteeId]) {

            } else {
                conditionCounter++;
                trusteeOpinion[trusteeId] = true;

                emit Judged(trustees[trusteeId], true);
            }   
        } else {
            if(trusteeOpinion[trusteeId]) {
                conditionCounter--;
                trusteeOpinion[trusteeId] = false;

                emit Judged(trustees[trusteeId], false);
            } else {

            }
        }
        return conditionCounter;
    }

}
