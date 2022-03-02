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

export function shouldBehaveLikeOracle(
    oracle: Contract,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    trustee0: SignerWithAddress,
    trustee1: SignerWithAddress,
    trustee2: SignerWithAddress,
    trustee3: SignerWithAddress,
    trustees: string[]
) {
    it("Should return the name and owenr address", async function() {
        expect(await oracle.name()).to.equal("Test");
        expect(await oracle.owner()).to.equal(owner.address);
    });

    it("return 5 trustees, 3 numerator", async function() {
        expect(await oracle.trustees(0)).to.equal(trustee0.address);
        expect(await oracle.trustees(1)).to.equal(trustee1.address);
        expect(await oracle.trustees(2)).to.equal(trustee2.address);
        expect(await oracle.trustees(3)).to.equal(trustee3.address);
        expect(await oracle.trustees(4)).to.equal(trustee2.address);

        expect(await oracle.numerator()).to.equal(3);
        expect(await oracle.denominator()).to.equal(5);
    })

    // Bignumberの使い方についてまだよくわかってないことが多いのでリサーチすること
    it("return trusteeIds of each trustee address", async function() {
        let id_address0 = new BN([0]);
        let id_address1 = new BN([1]);
        let id_address2 = new BN([2,4]);
        let id_address3 = new BN([3]);
        //@ts-ignore
        expect(new BN(await oracle.getTrusteeIds(trustee0.address))).to.be.bignumber.equal(id_address0);
        //@ts-ignore
        expect(new BN(await oracle.getTrusteeIds(trustee1.address))).to.be.bignumber.equal(id_address1);
        //@ts-ignore
        expect(new BN(await oracle.getTrusteeIds(trustee2.address))).to.be.bignumber.equal(id_address2);
        //@ts-ignore
        expect(new BN(await oracle.getTrusteeIds(trustee3.address))).to.be.bignumber.equal(id_address3);
    })

    it("Should return false trustee opinions and false condition when initialized", async function() {
        expect(await oracle.trusteeOpinion(0)).to.equal(false);
        expect(await oracle.trusteeOpinion(1)).to.equal(false);
        expect(await oracle.trusteeOpinion(2)).to.equal(false);
        expect(await oracle.trusteeOpinion(3)).to.equal(false);
        expect(await oracle.trusteeOpinion(4)).to.equal(false);

        expect(await oracle.conditionCounter()).to.equal(0);
        expect(await oracle.condition()).to.equal(false);
    })

    it("Should return correct condition according to trustees Judge", async function() {
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.emit(oracle, "Judged")
            .withArgs(trustee0.address, true);
        expect(await oracle.conditionCounter()).to.equal(1);
        expect(await oracle.condition()).to.equal(false);

        await oracle.connect(trustee1).judge(true, 1);
        expect(await oracle.conditionCounter()).to.equal(2);
        expect(await oracle.condition()).to.equal(false);

        await oracle.connect(trustee2).judge(true, 2);
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

        await oracle.connect(trustee0).judge(false, 0);
        expect(await oracle.conditionCounter()).to.equal(2);
        expect(await oracle.condition()).to.equal(false);
    })

    it("Should revert not match address and trusteeId", async function() {
        await expect(oracle.connect(alice).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
        
        await expect(oracle.connect(trustee1).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
        
        await expect(oracle.connect(owner).judge(true, 0))
            .to.be.revertedWith("Oracle: Not a trustee");
    })

    it("Should revert same opinion", async function() {
        await expect(oracle.connect(trustee0).judge(false, 0))
            .to.be.revertedWith("Oracle: The opinion you're trying to send has already been sent");
        
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.emit(oracle, "Judged")
            .withArgs(trustee0.address, true);
        
        await expect(oracle.connect(trustee0).judge(true, 0))
            .to.be.revertedWith("Oracle: The opinion you're trying to send has already been sent");
    })

    it("Should revert set trustees from other than owner", async function() {
        await expect(oracle.connect(alice).setTrustees(trustees, 3))
            .to.be.revertedWith("Ownable: caller is not the owner");
    })

    it("Should revert numerator larger than number of trustees", async function() {
        await expect(oracle.connect(owner).setTrustees(trustees, 6))
            .to.be.revertedWith("Oracle: Numerator must be less than or equal to denominator");
    })
}

module.exports = {
    shouldBehaveLikeOracle,
}