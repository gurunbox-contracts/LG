// import { expect } from 'chai';
// import { ethers } from "hardhat";
// import { Contract, ContractFactory, BigNumber } from "ethers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// import { willFixture } from "./shared/fixtures";

// describe("Will", function() {
//     let oracle: Contract;
//     let will: Contract;
//     let token20: Contract;
//     let token721: Contract;
//     let owner: SignerWithAddress;
//     let alice: SignerWithAddress;
//     let trustee0: SignerWithAddress;
//     let trustee1: SignerWithAddress;
//     let trustee2: SignerWithAddress;
//     let trustee3: SignerWithAddress;
//     let trustee4: SignerWithAddress;
//     let trustees: string[];
//     let receiver0: SignerWithAddress;
//     let gracePeriod: BigNumber;

//     beforeEach(async function() {
//         [
//             owner, 
//             alice, 
//             trustee0, 
//             trustee1, 
//             trustee2, 
//             trustee3,
//             receiver0
//         ] = await ethers.getSigners();
//         trustee4 = trustee2;
//         trustees = [
//             trustee0.address,
//             trustee1.address,
//             trustee2.address,
//             trustee3.address,
//             trustee4.address,
//         ]; 
//         gracePeriod = BigNumber.from(100);

//         const fixture = await willFixture(
//             "Test", 
//             owner, 
//             trustees, 
//             3, 
//             receiver0,
//             gracePeriod
//         );
//         oracle = fixture.oracle;
//         will = fixture.will;
//         token20 = fixture.token20;
//         token721 = fixture.token721;
//     })

//     it("Should return the initialized values", async function() {
//         expect(await will.owner()).to.equal(owner.address);
//         expect(await will.receiver()).to.equal(receiver0.address);
//         expect(await will.oracle()).to.equal(oracle.address);
//         expect(await will.willId()).to.equal(0);
//     })
// })