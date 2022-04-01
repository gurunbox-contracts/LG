import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory, Wallet, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockProvider } from 'ethereum-waffle';
const provider = new MockProvider();

interface OracleFixture {
    oracleFactory: Contract;
    oracle: Contract;
}

export async function oracleFixture(
    proposition: string,
    owner: SignerWithAddress,
    receiver: SignerWithAddress,
    trustees: string[],
    numerator: number,
    gracePeriod: BigNumber
): Promise<OracleFixture> {
    const OracleFactory = await ethers.getContractFactory("OracleFactory");
    const oracleFactory = await OracleFactory.deploy();
    await oracleFactory.deployed();
    await oracleFactory.connect(owner).createOracle(
        proposition, 
        owner.address, 
        receiver.address,
        trustees, 
        numerator, 
        gracePeriod
        );
    const oracleAddress: string = await oracleFactory.getOracle(0);
    const oracle: Contract = await ethers.getContractAt("Oracle", oracleAddress);

    return { oracleFactory, oracle };
}

interface Token20Fixture {
    token20A: Contract;
    token20B: Contract;
    token20C: Contract;
}
