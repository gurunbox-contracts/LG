import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, BigNumber, constants } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { oracleFixture } from "./shared/fixtures";

describe("Oracle", function() {
    let oracleFactory: Contract;
    let oracle: Contract;
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let trustee0: SignerWithAddress;
    let trustee1: SignerWithAddress;
    let trustee2: SignerWithAddress;
    let trustee3: SignerWithAddress;
    let trustee4: SignerWithAddress;
    let trustees: string[];
    let receiver0: SignerWithAddress;
    let gracePeriod: BigNumber;

    beforeEach(async function() {
        [
            owner, 
            alice, 
            bob,
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
        gracePeriod = BigNumber.from(100);

        const fixture = await oracleFixture(
            "Test", 
            owner,  
            receiver0,
            trustees, 
            3,
            gracePeriod
        );
        oracleFactory = fixture.oracleFactory;
        oracle = fixture.oracle;
    })

    it("Should return the initialized values", async function() {
        expect(await oracle.proposition()).to.equal("Test");

        expect(await oracle.owner()).to.equal(owner.address);

        expect(await oracle.receiver()).to.equal(receiver0.address);

        expect(await oracle.trustees(0)).to.equal(trustee0.address);
        expect(await oracle.trustees(1)).to.equal(trustee1.address);
        expect(await oracle.trustees(2)).to.equal(trustee2.address);
        expect(await oracle.trustees(3)).to.equal(trustee3.address);
        expect(await oracle.trustees(4)).to.equal(trustee2.address);

        expect(await oracle.trusteesLength()).to.equal(5);
        expect(await oracle.numerator()).to.equal(3);
    });
    
    it("Should return false trustee opinions and false condition when initialized", async function() {
        expect(await oracle.trusteeOpinion(0)).to.equal(false);
        expect(await oracle.trusteeOpinion(1)).to.equal(false);
        expect(await oracle.trusteeOpinion(2)).to.equal(false);
        expect(await oracle.trusteeOpinion(3)).to.equal(false);
        expect(await oracle.trusteeOpinion(4)).to.equal(false);

        expect(await oracle.conditionCounter()).to.equal(0);
        expect(await oracle.condition()).to.equal(false);
    })

    it("Should change trustees from owner", async function() {
        const newTrustees: string[] = [alice.address, bob.address];
        trustees = [
            trustee0.address,
            trustee1.address,
            trustee2.address,
            trustee3.address,
            trustee4.address,
        ]; 
        await oracle.connect(owner).changeTrustees(newTrustees, 1)

        expect(await oracle.trustees(0)).to.equal(alice.address);
        expect(await oracle.trustees(1)).to.equal(bob.address);

        expect(await oracle.trusteesLength()).to.equal(2);
        expect(await oracle.numerator()).to.equal(1);
    })

    it("Should revert set trustees from other than owner", async function() {
        await expect(oracle.connect(alice).changeTrustees(trustees, 3))
            .to.be.revertedWith("Ownable: caller is not the owner");
    })

    it("Should revert set trustees by numerator larger than number of trustees", async function() {
        await expect(oracle.connect(owner).changeTrustees(trustees, 6))
            .to.be.revertedWith("Oracle: Numerator must be less than or equal to denominator");
    })

    it("Should judge from trustees and return correct condition", async function() {
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.emit(oracle, "Judged")
            .withArgs(trustee0.address, true);
        expect(await oracle.conditionCounter()).to.equal(1);
        expect(await oracle.condition()).to.equal(false);

        await oracle.connect(trustee1).judge(true, 1);
        expect(await oracle.conditionCounter()).to.equal(2);
        expect(await oracle.condition()).to.equal(false);

        await expect(oracle.connect(trustee2).judge(true, 2))
            .to.emit(oracleFactory, "Transfer")
            .withArgs(constants.AddressZero, owner.address, 1);
        expect(await oracle.conditionCounter()).to.equal(3);
        expect(await oracle.condition()).to.equal(true);

        await oracle.connect(trustee3).judge(true, 3);
        expect(await oracle.conditionCounter()).to.equal(4);
        expect(await oracle.condition()).to.equal(true);

        await oracle.connect(trustee2).judge(true, 4);
        expect(await oracle.conditionCounter()).to.equal(5);
        expect(await oracle.condition()).to.equal(true);

        await oracle.connect(trustee2).judge(false, 2);
        expect(await oracle.conditionCounter()).to.equal(4);
        expect(await oracle.condition()).to.equal(true);

        await oracle.connect(trustee2).judge(false, 4);
        expect(await oracle.conditionCounter()).to.equal(3);
        expect(await oracle.condition()).to.equal(true);

        await expect(oracle.connect(trustee0).judge(false, 0))
            .to.emit(oracleFactory, "Transfer")
            .withArgs(owner.address, constants.AddressZero, 1);
        expect(await oracle.conditionCounter()).to.equal(2);
        expect(await oracle.condition()).to.equal(false);
    })

    it("Should revert judge from another address or another trusteeId", async function() {
        await expect(oracle.connect(alice).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
        
        await expect(oracle.connect(trustee1).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
        
        await expect(oracle.connect(owner).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
    })

    it("Should revert judge by same opinion", async function() {
        await expect(oracle.connect(trustee0).judge(false, 0))
            .to.be.revertedWith("Oracle: The opinion you're trying to send has already been sent");
        
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.emit(oracle, "Judged")
            .withArgs(trustee0.address, true);
        
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.be.revertedWith("Oracle: The opinion you're trying to send has already been sent");
    })

    it("Should return fulfillment time when condition counter reachs numerator", async function() {
        expect(await oracle.fulfillmentTime()).to.equal(0);

        await oracle.connect(trustee0).judge(true, 0);
        await oracle.connect(trustee1).judge(true, 1);
        await expect(oracle.connect(trustee2).judge(true, 2))
            .to.emit(oracleFactory, "Transfer")
            .withArgs(constants.AddressZero, owner.address, 1);
        let latestBlock = await ethers.provider.getBlock("latest");
        expect(await oracle.fulfillmentTime()).to.equal(BigNumber.from(latestBlock.timestamp));

        await expect(oracle.connect(trustee1).judge(false, 1))
            .to.emit(oracleFactory, "Transfer")
            .withArgs(owner.address, constants.AddressZero, 1);
        await expect(oracle.connect(trustee3).judge(true, 3))
            .to.emit(oracleFactory, "Transfer")
            .withArgs(constants.AddressZero, owner.address, 2);
        latestBlock = await ethers.provider.getBlock("latest");
        expect(await oracle.fulfillmentTime()).to.equal(BigNumber.from(latestBlock.timestamp));
    })

    it("Should not return fulfillment time when other than just fulfillment", async function() {
        await oracle.connect(trustee0).judge(true, 0);
        await oracle.connect(trustee1).judge(true, 1);
        await oracle.connect(trustee2).judge(true, 2);
        await oracle.connect(trustee3).judge(true, 3);
        let latestBlock = await ethers.provider.getBlock("latest");
        expect(await oracle.fulfillmentTime()).to.not.equal(BigNumber.from(latestBlock.timestamp));

        await oracle.connect(trustee1).judge(false, 1);
        latestBlock = await ethers.provider.getBlock("latest");
        expect(await oracle.fulfillmentTime()).to.not.equal(BigNumber.from(latestBlock.timestamp));
    })
})