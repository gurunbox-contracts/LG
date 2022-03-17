// import { expect } from 'chai';
// import { ethers } from "hardhat";
// import { Contract, ContractFactory, constants } from "ethers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// import { willFactoryFixture } from './shared/fixtures';
// import { shouldBehaveLikeOracle } from "./Oracle.behavior";

//   describe("WillFactory", function() {
//     let name = "Test";

//     let willFactory: Contract;
//     let owner: SignerWithAddress;
//     let receiver0: SignerWithAddress;
//     let receiver1: SignerWithAddress;
//     let receiver2: SignerWithAddress;
//     let receiver3: SignerWithAddress;
//     let alice: SignerWithAddress;
//     let trustee0: SignerWithAddress;
//     let trustee1: SignerWithAddress;
//     let trustee2: SignerWithAddress;
//     let trustee3: SignerWithAddress;
//     let trustee4: SignerWithAddress;
//     let trustees: string[];
//     let numerator: number;

//     beforeEach(async function() {
//         [
//             owner, 
//             receiver0, receiver1, receiver2, receiver3,
//             alice, 
//             trustee0, trustee1, trustee2, trustee3
//         ] = await ethers.getSigners();
//         trustee4 = trustee2;
//         trustees = [
//             trustee0.address,
//             trustee1.address,
//             trustee2.address,
//             trustee3.address,
//             trustee4.address,
//         ];   
//         numerator = 3;
//         const fixture = await willFactoryFixture(name, owner, trustees, numerator, receiver0.address);
//         willFactory = fixture.willFactory;
//     })

//     it('create will', async function() {
//         await willFactory.connect(owner).createWill(receiver1.address);
//         await willFactory.connect(owner).createWill(receiver2.address);
//         await willFactory.connect(owner).createWill(receiver3.address);

//         expect(await willFactory.getReceivers(0)).to.equal(receiver0.address);
//         expect(await willFactory.getReceivers(1)).to.equal(receiver1.address);
//         expect(await willFactory.getReceivers(2)).to.equal(receiver2.address);
//         expect(await willFactory.getReceivers(3)).to.equal(receiver3.address);

//         expect(await willFactory.willNumber()).to.equal(4);
//     })

//     it('should revert create will from other than owner', async function() {
//         await expect(willFactory.connect(alice).createWill(receiver0.address))
//             .to.be.revertedWith('Ownable: caller is not the owner');
//     })

//     it('should revert create will from address (0)', async function() {
//         await expect(willFactory.connect(owner).createWill(constants.AddressZero))
//             .to.be.revertedWith('WillFactory: RECEIVER_ZERO_ADDRESS');
//     })

//     it('shouldBehaveLikeOracle', () => {
//         shouldBehaveLikeOracle(
//             willFactory,
//             owner,
//             alice,
//             trustee0,
//             trustee1,
//             trustee2,
//             trustee3,
//             trustees
//         )
//     })
//   })