const { expect } = require("chai");
const { ethers } = require("hardhat");   
// const {
//     BN,
//     constants,
//     expectEvent,
//     expectRevert,
//   } = require('@openzeppelin/test-helpers')

describe("Oracle deployed and set 3 of 5", async function() {

    const [owner, alice, trustee0, trustee1, trustee2, trustee3, trustee4] = await ethers.getSigners();
    let trustees = [
        trustee0.address, 
        trustee1.address, 
        trustee2.address, 
        trustee3.address, 
        trustee4.address
    ];        
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy("Test", owner.address);
    await oracle.deployed();

    // expectRevert(await oracle.connect(alice).setTrustees(trustees, 3), "Only owenr can set trustees");
    await oracle.connect(owner).setTrustees(trustees, 3);

    it("Should return the name and owenr address", async function() {
        expect(await oracle.name()).to.equal("Test");
        expect(await oracle.owner()).to.equal(owner.address);
    })

    it("return 5 trustees with 3 numerator and false condition when initialized", async function() {
        expect(await oracle.trustees(0)).to.equal(trustee0.address);
        expect(await oracle.trustees(1)).to.equal(trustee1.address);
        expect(await oracle.trustees(2)).to.equal(trustee2.address);
        expect(await oracle.trustees(3)).to.equal(trustee3.address);
        expect(await oracle.trustees(4)).to.equal(trustee4.address);

        expect(await oracle.numerator()).to.equal(3);
        expect(await oracle.denominator()).to.equal(5);
        expect(await oracle.conditionCounter()).to.equal(0);
        expect(await oracle.condition()).to.equal(false);
    })
})