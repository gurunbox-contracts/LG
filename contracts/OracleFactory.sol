// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC721 } from './@OpenZeppelin/contracts/token/ERC721/ERC721.sol';
import { Ownable } from './utils/Ownable.sol';
import { IOracleFactory } from './interfaces/IOracleFactory.sol';
import { IOracle } from './interfaces/IOracle.sol'; 
import { Oracle } from './Oracle.sol';
import { Counters } from './utils/Counters.sol';

contract OracleFactory is ERC721, Ownable, IOracleFactory {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    uint256 private nextOracleId;
    string private _tokenURI;
    bool private constant transferable = false; 

    // Mapping from oracleId to Oracle address
    mapping(uint256 => address) public override getOracle;

    // Mapping from Oracle address to oracleId
    mapping(address => uint256) public override getOracleId;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Alert NFT should be minted to owner when condition is met.
    constructor() ERC721("Alert NFT", "ALERT") {
        _mint(msg.sender, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    function createOracle(
        string memory name_, 
        address _owner, 
        address _receiver, 
        address[] memory _trustees, 
        uint256 _numerator,
        uint256 _gracePeriod
    ) external override returns (address oracle) {

        bytes32 _salt = keccak256(abi.encodePacked(name_, _owner));
        oracle = address(new Oracle{salt: _salt}());

        IOracle(oracle).initialize(name_, _owner, _receiver, _trustees, _numerator, _gracePeriod);
        getOracle[nextOracleId] = oracle;
        getOracleId[oracle] = nextOracleId;
        nextOracleId++;

        emit OracleCreated(oracle, nextOracleId - 1, name_, _owner);
    }

    function mint(address to, uint256 oracleId) external override returns (uint256 tokenId) {
        require(msg.sender == getOracle[oracleId], "OracleFactory: caller is not oracle");

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        tokenId = _tokenIdTracker.current();
        _mint(to, tokenId);
        _tokenIdTracker.increment();
    }

    function burn(uint256 tokenId, uint256 oracleId) external override {
        require(msg.sender == getOracle[oracleId], "OracleFactory: caller is not oracle");

        _burn(tokenId);
    }

    function setTokenURI(string memory uri) external override onlyOwner {
        _tokenURI = uri;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return _tokenURI;
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(transferable, "NTT");
        require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public override {
        require(transferable, "NTT");
        address owner = ERC721.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits a {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal override {
        require(transferable, "NTT");
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
}