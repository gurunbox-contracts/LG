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

export async function token20Fixture(
    initialAccount: SignerWithAddress,
    initialBalance: BigNumber
): Promise<Token20Fixture> {
    const Token20 = await ethers.getContractFactory("ERC20Mock");
    const token20A = await Token20.deploy("Token20A", "T20A", initialAccount.address, initialBalance);
    await token20A.deployed();

    const token20B = await Token20.deploy("Token20B", "T20B", initialAccount.address, initialBalance);
    await token20B.deployed();

    const token20C = await Token20.deploy("Token20C", "T20C", initialAccount.address, initialBalance);
    await token20C.deployed();

    return { token20A, token20B, token20C };
}
