import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockProvider } from 'ethereum-waffle';
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const provider = new MockProvider();
const [owner, wallet] = provider.getWallets();

  describe("Will", function() {
    let Will: ContractFactory;
    let will: Contract;
    // let owner: SignerWithAddress;
    let deployer: SignerWithAddress;
    let receiver: SignerWithAddress;
    let alice: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustee2: SignerWithAddress;
    let trustee3: SignerWithAddress;
    let trustee4: SignerWithAddress;
    let trustees: string[];

    beforeEach(async function() {
        [deployer, receiver, alice, trustee0, trustee1, trustee2, trustee3] = await ethers.getSigners();
        trustee4 = trustee2;
        trustees = [
            trustee0.address,
            trustee1.address,
            trustee2.address,
            trustee3.address,
            trustee4.address,
        ];   
        Will = await ethers.getContractFactory("Will");
        will = await Will.connect(deployer).deploy();
        await will.deployed();
        await expect(will.connect(alice).initialize(owner.address, receiver.address, 0))
            .to.be.revertedWith("Will: FORBIDDEN");
        await will.connect(deployer).initialize(owner.address, receiver.address, 0);
    })

    it('Should return willFactory address', async function() {
        expect(await will.willFactory()).to.equal(deployer.address);
    })

    it('Should return owner address', async function() {
        expect(await will.owner()).to.equal(owner.address);
    })

    it('deposit ETH', async function() {
        await owner.sendTransaction({
            to: will.address,
            value: ethers.utils.parseEther('1')
        })
        expect(await provider.getBalance(will.address)).to.equal(ethers.utils.parseEther('1'));

        await will.connect(owner).depositETH({ 
            value: ethers.utils.parseEther('1'), 
            gasLimit:100000 
        });
        expect(await provider.getBalance(will.address)).to.equal(ethers.utils.parseEther('2'));

    })
  })