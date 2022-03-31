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

// interface WillFixture extends OracleFixture {
//     token20: Contract;
//     token721: Contract;
// }
// 
// export async function willFixture(
//     proposition: string,
//     owner: SignerWithAddress,
//     receiver: SignerWithAddress,
//     trustees: string[],
//     numerator: number,
//     gracePeriod: BigNumber
// ): Promise<WillFixture> {
//     const fixture = await oracleFixture(
//         proposition,
//         owner,
//         receiver,
//         trustees,
//         numerator,
//         gracePeriod
//     );
//     const Token20 = await ethers.getContractFactory("Token20");
//     const token20 = await Token20.deploy("Test20", "T20");
//     const Token721 = await ethers.getContractFactory("Token721");
//     const token721 = await Token721.deploy("Test721", "T721", "http://example.com/");
//     await token20.deployed();
//     await token721.deployed();
//     return {
//         ...fixture,
//         token20,
//         token721
//     };
// }
