import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');

  describe("WillFactory", function() {
    let WillFactory: ContractFactory;
    let willFactory: Contract;
    let owner: SignerWithAddress;
    let receiver: SignerWithAddress;
    let alice: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustee2: SignerWithAddress;
    let trustee3: SignerWithAddress;
    let trustee4: SignerWithAddress;
    let trustees: string[];

    beforeEach(async function() {
        [owner, receiver, alice, trustee0, trustee1, trustee2, trustee3] = await ethers.getSigners();
        trustee4 = trustee2;
        trustees = [
            trustee0.address,
            trustee1.address,
            trustee2.address,
            trustee3.address,
            trustee4.address,
        ];   
        WillFactory = await ethers.getContractFactory("WillFactory");
        willFactory = await WillFactory.deploy("Test", owner.address);
        await willFactory.deployed();
    })

    it('create will', async function() {
        await willFactory.createWill(receiver.address);
        expect(await willFactory.getReceivers(0)).to.equal(receiver.address);
    })
  })