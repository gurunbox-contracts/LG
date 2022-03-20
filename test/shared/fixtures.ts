import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory, Wallet, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockProvider } from 'ethereum-waffle';
const provider = new MockProvider();

interface OracleFixture {
    oracleFactory: Contract;
    oracle: Contract;
    will: Contract;
}

export async function oracleFixture(
    name: string,
    owner: SignerWithAddress,
    trustees: string[],
    numerator: number,
    receiver: SignerWithAddress,
    gracePeriod: BigNumber
): Promise<OracleFixture> {
    const OracleFactory = await ethers.getContractFactory("OracleFactory");
    const oracleFactory = await OracleFactory.deploy();
    await oracleFactory.deployed();
    await oracleFactory.connect(owner).createOracle(
        name, 
        owner.address, 
        trustees, 
        numerator, 
        receiver.address,
        gracePeriod
        );
    const oracleAddress: string = await oracleFactory.getOracles(0);
    const oracle: Contract = await ethers.getContractAt("Oracle", oracleAddress);
    const willAddress: string = await oracle.getWills(0);
    const will: Contract = await ethers.getContractAt("Will", willAddress);

    return { oracleFactory, oracle, will };
}

interface WillFixture extends OracleFixture {
    token20: Contract;
    token721: Contract;
}

export async function willFixture(
    name: string,
    owner: SignerWithAddress,
    trustees: string[],
    numerator: number,
    receiver: SignerWithAddress,
    gracePeriod: BigNumber
): Promise<WillFixture> {
    const fixture = await oracleFixture(
        name,
        owner,
        trustees,
        numerator,
        receiver,
        gracePeriod
    );
    const Token20 = await ethers.getContractFactory("Token20");
    const token20 = await Token20.deploy("Test20", "T20");
    const Token721 = await ethers.getContractFactory("Token721");
    const token721 = await Token721.deploy("Test721", "T721", "http://example.com/");
    await token20.deployed();
    await token721.deployed();
    return {
        ...fixture,
        token20,
        token721
    };
}

// interface WillFactoryFixture {
//     willFactory: Contract;
// }

// export async function willFactoryFixture(
//     name: string,
//     owner: SignerWithAddress,
//     trustees: string[],
//     numerator: number,
//     receiver: string
//     ): Promise<WillFactoryFixture> {
//     let WillFactory = await ethers.getContractFactory("WillFactory");
//     const willFactory = await WillFactory.deploy(name, owner.address, trustees, numerator, receiver);
//     return { willFactory };
// }

// interface WillFixture extends WillFactoryFixture {
//     will: Contract;
//     token20: Contract;
//     token721: Contract;
// }

// export async function willFixture(
//     name: string,
//     owner: SignerWithAddress,
//     receiver: SignerWithAddress
// ): Promise<WillFixture> {
//     const { willFactory } = await willFactoryFixture(name, owner);
//     await willFactory.connect(owner).createWill(receiver.address);
//     return { willFactory, will, token20, token721 }
// }
