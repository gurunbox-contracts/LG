// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IOracle {
    event Judged(address trustee, bool TF);
    event TransferTrustee(address indexed previousTrustee, address indexed newTrustee, uint trusteeId);

    function condition() external view returns (bool);
    function name() external view returns (string memory);
    function conditionCounter() external view returns (uint);
    function trustees(uint) external view returns (address);
    function numerator() external view returns (uint);
    function denominator() external view returns (uint);

    function trusteeOpinion(uint trusteeId) external view returns (bool);
    function trusteeIds(address _trustee) external view returns (uint);
    function changeTrustee(address _trustee, uint trusteeId) external;

    function judge(bool TF, uint trusteeId) external returns (uint);   
}