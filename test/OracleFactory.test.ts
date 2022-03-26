import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, constants } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("OracleFactory", function() {
    let OracleFactory: ContractFactory;
    let oracleFactory: Contract;
    let owner: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustees: string[];
    let receiver0: SignerWithAddress;
    let gracePeriod: BigNumber;

    beforeEach(async function() {
        [
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