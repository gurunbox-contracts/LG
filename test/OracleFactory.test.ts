import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, constants } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("OracleFactory", function() {
    let OracleFactory: ContractFactory;
    let oracleFactory: Contract;
    let deployer: SignerWithAddress;
    let owner: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustees: string[];
    let receiver0: SignerWithAddress;
    let gracePeriod: BigNumber;

    beforeEach(async function() {
        [
            deployer,
            owner,
            trustee0, 
            trustee1,
            receiver0
        ] = await ethers.getSigners();
        trustees = [
            trustee0.address,
            trustee1.address,
        ]; 
        gracePeriod = BigNumber.from(100);

        OracleFactory = await ethers.getContractFactory("OracleFactory");
        oracleFactory = await OracleFactory.deploy();
        await oracleFactory.deployed();
    })

    it("Should return name, symbol and tokenURI", async function() {
        expect(await oracleFactory.name()).to.equal("Alert NFT");
        expect(await oracleFactory.symbol()).to.equal("ALERT");
    })

    it("Should support interfaces of ERC165, ERC721, ERC721Metadata", async function() {
        const INTERFACE_ID_ERC165 = "0x01ffc9a7";
        const INTERFACE_ID_ERC721 = "0x80ac58cd";
        const INTERFACE_ID_ERC721Metadata = "0x5b5e139f";

        expect(await oracleFactory.supportsInterface(INTERFACE_ID_ERC165)).to.be.true;
        expect(await oracleFactory.supportsInterface(INTERFACE_ID_ERC721)).to.be.true;
        expect(await oracleFactory.supportsInterface(INTERFACE_ID_ERC721Metadata)).to.be.true;
    })

    it("Should return balance of deployer and owner of tokenId 0", async function() {
        expect(await oracleFactory.balanceOf(deployer.address)).to.equal(1);
        expect(await oracleFactory.ownerOf(0)).to.equal(deployer.address);
    })

    it("Should return tokenURI of tokenId 0 when initialized and set another tokenURI", async function() {
        expect(await oracleFactory.tokenURI(0)).to.equal("");

        await oracleFactory.setTokenURI("https://example.com/");
        expect(await oracleFactory.tokenURI(0)).to.equal("https://example.com/");
    })

    it("Should return getApproved of tokenId 0", async function() {
        expect(await oracleFactory.getApproved(0)).to.equal(constants.AddressZero);
    })



    it("Should revert approve", async function() {
        await expect(oracleFactory.approve(constants.AddressZero, 0))
            .to.be.revertedWith("NTT");
    })




    it("Should create Oracle", async function() {
        expect(await oracleFactory.connect(owner).createOracle(
            "Test", 
            owner.address, 
            trustees, 
            1, 
            receiver0.address,
            gracePeriod
            ))
            .to.emit(oracleFactory, "OracleCreated")
            .withArgs(
                await oracleFactory.getOracles(0),
                0,
                "Test",
                owner.address,
            );
        
        let oracleAddress = await oracleFactory.getOracles(0);
        let oracle = await ethers.getContractAt("Oracle", oracleAddress);

        expect(await oracle.proposition()).to.equal("Test");
        expect(await oracle.owner()).to.equal(owner.address);
        expect(await oracle.trustees(0)).to.equal(trustee0.address);
        expect(await oracle.trustees(1)).to.equal(trustee1.address);
        expect(await oracle.numerator()).to.equal(1);

        let willAddress = await oracle.getWills(0);
        let will = await ethers.getContractAt("Will", willAddress);

        expect(await will.receiver()).to.equal(receiver0.address);
    })

    it("Should revert create same Oracle", async function() {
        await oracleFactory.connect(owner).createOracle(
            "Test", 
            owner.address, 
            trustees, 
            1, 
            receiver0.address,
            gracePeriod
            );
        
        await expect(oracleFactory.connect(owner).createOracle(
            "Test", 
            owner.address, 
            trustees, 
            1, 
            receiver0.address,
            gracePeriod
            )).to.be.revertedWith("Create2: Failed on deploy");
    })
})