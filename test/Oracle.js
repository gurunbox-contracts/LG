const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oracle", function() {
    it("Should return the name and owenr address", async function() {
        const [owner, alice] = await ethers.getSigners();
        const Oracle = await ethers.getContractFactory("Oracle");
        const oracle = await Oracle.deploy("Test", owner.address);
        await oracle.deployed();

        expect(await oracle.name()).to.equal("Test");
        expect(await oracle.name()).to.not.equal("another name");

        expect(await oracle.owner()).to.equal(owner.address);
        expect(await oracle.owner()).to.not.equal(alice.address);
    })
})