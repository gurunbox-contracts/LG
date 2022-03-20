import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Will", function() {
    let OracleFactory: ContractFactory;
    let oracleFactory: Contract;
    let oracleAddress: string
    let oracle: Contract;
    let willAddress0: string;
    let will0: Contract;
    let token20A: Contract;
    let token721A: Contract;
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustee2: SignerWithAddress;
    let trustee3: SignerWithAddress;
    let trustee4: SignerWithAddress;
    let trustees: string[];
    let receiver0: SignerWithAddress;

    beforeEach(async function() {
        [
            owner, 
            alice, 
            trustee0, 
            trustee1, 
            trustee2, 
            trustee3,
            receiver0
        ] = await ethers.getSigners();
        trustee4 = trustee2;
        trustees = [
            trustee0.address,
            trustee1.address,
            trustee2.address,
            trustee3.address,
            trustee4.address,
        ]; 
        OracleFactory = await ethers.getContractFactory("OracleFactory");
        oracleFactory = await OracleFactory.deploy();
        await oracleFactory.deployed();

        await oracleFactory.connect(owner).createOracle(
            "Test", 
            owner.address, 
            trustees, 
            3, 
            receiver0.address
            );
        oracleAddress = await oracleFactory.getOracles(0);
        oracle = await ethers.getContractAt("Oracle", oracleAddress);
        willAddress0 = await oracle.getWills(0);
        will0 = await ethers.getContractAt("Will", willAddress0);
    })
})