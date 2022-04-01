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

interface Token721Fixture {
    token721A: Contract;
    token721B: Contract;
    token721C: Contract;
}

export async function token721Fixture(
    initialAccount: SignerWithAddress,
    initialIds: BigNumber[]
): Promise<Token721Fixture> {
    const Token721 = await ethers.getContractFactory("ERC721Mock");
    const token721A = await Token721.deploy("Token721A", "T721A");
    await token721A.deployed();
    await token721A.mint(initialAccount.address, initialIds[0]);

    const token721B = await Token721.deploy("Token721B", "T721B");
    await token721B.deployed();
    await token721B.mint(initialAccount.address, initialIds[1]);

    const token721C = await Token721.deploy("Token721C", "T721C");
    await token721C.deployed();
    await token721C.mint(initialAccount.address, initialIds[2]);
    await token721C.mint(initialAccount.address, initialIds[3]);

    return { token721A, token721B, token721C };
}
