// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IOracle {
    event Judged(address trustee, bool TF);
    event PartyChanged(address owner, address receiver, address[] trustees);

    function oracleFactory() external view returns (address);
    function receiver() external view returns (address);
    function trustees(uint256) external view returns (address);
    function numerator() external view returns (uint256);
    function gracePeriod() external view returns (uint256);
    function conditionCounter() external view returns (uint256);
    function fulfillmentTime() external view returns (uint256);
    function trusteeOpinion(uint256 trusteeId) external view returns (bool);

    function condition() external view returns (bool);
    function name() external view returns (string memory);
    function trusteesLength() external view returns (uint256);
    
    function initialize(
        string memory name_, 
        address _owner, 
        address _receiver, 
        address[] memory _trustees, 
        uint256 _numerator,
        uint256 _gracePeriod
    ) external;
    function changeReceiver(address _receiver) external;
    function changeTrustees(address[] memory _trustees, uint256 _numerator) external;
    function changeGracePeriod(uint256 _gracePeriod) external;
    function judge(bool TF, uint256 trusteeId) external;
    function claim20(address[] calldata tokens, address to, uint256[] calldata amounts) external;
    function claim721(address[] calldata tokens, address to, uint256[] calldata tokenId) external;
}