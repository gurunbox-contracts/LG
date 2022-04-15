import { expect } from 'chai';
import { ethers } from "hardhat";
import { Contract, BigNumber, constants } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { oracleFixture, token20Fixture, token721Fixture } from "./shared/fixtures";

import { MockProvider } from 'ethereum-waffle';
const provider = new MockProvider();

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

    it("Should return the default value", async function() {
        expect(await oracle.oracleFactory()).to.equal(oracleFactory.address);
        expect(await oracle.fulfillmentTime()).to.equal(0);
    })

    it("Should return the initialized values", async function() {
        expect(await oracle.name()).to.equal("Test");

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

    describe("initialize()", () => {
        it("Should revert when called by other than oracleFactory", async function() {
            await expect(oracle.connect(alice).initialize(
                "Test", 
                owner.address,  
                receiver0.address,
                trustees, 
                3,
                gracePeriod
            )).to.be.revertedWith("Oracle: must be called by oracle factory");
        })
    })

    describe("transferOwnership()", () => {
        it("Should transfer ownership", async function() {
            expect(await oracle.transferOwnership(alice.address)
                ).to.emit(oracle, "PartyChanged")
                .withArgs(alice.address);

            expect(await oracle.owner()).to.equal(alice.address);
        })

        it("Should revert when called by other than owner", async function() {
            await expect(oracle.connect(alice).transferOwnership(bob.address)).to.be.revertedWith("Oracle: must be called by owner");
        })
    })

    describe("changeReceiver()", () => {
        it("Should change receiver when called by owner", async function() {
            expect(await oracle.connect(owner).changeReceiver(alice.address)
                ).to.emit(oracle, "PartyChanged")
                .withArgs(owner.address, alice.address, trustees);
            expect(await oracle.receiver()).to.equal(alice.address);
        })

        it("Should revert when called by other than owner", async function() {
            await expect(oracle.connect(alice).changeReceiver(alice.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("changeTrustees()", () => {
        it("Should change trustees when called by owner", async function() {
            const newTrustees: string[] = [alice.address, bob.address];
            trustees = [
                trustee0.address,
                trustee1.address,
                trustee2.address,
                trustee3.address,
                trustee4.address,
            ]; 
            expect(await oracle.connect(owner).changeTrustees(newTrustees, 1)
                ).to.emit(oracle, "PartyChanged")
                .withArgs(owner.address, receiver0.address, newTrustees);
    
            expect(await oracle.trustees(0)).to.equal(alice.address);
            expect(await oracle.trustees(1)).to.equal(bob.address);
    
            expect(await oracle.trusteesLength()).to.equal(2);
            expect(await oracle.numerator()).to.equal(1);
        })

        it("Should revert when called by other than owner", async function() {
            await expect(oracle.connect(alice).changeTrustees(trustees, 3))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should revert when numerator is larger than the number of trustees", async function() {
            await expect(oracle.connect(owner).changeTrustees(trustees, 6))
                .to.be.revertedWith("Oracle: must have numerator less than or equal to denominator");
        })
    })

    describe("changeGracePeriod()", () => {
        const newGracePeriod = BigNumber.from(200);

        it("Should change grace period when called by owner", async function() {
            await oracle.connect(owner).changeGracePeriod(newGracePeriod);
            expect(await oracle.gracePeriod()).to.equal(newGracePeriod);
        })

        it("Should revert when called by other than owner", async function() {
            await expect(oracle.connect(alice).changeGracePeriod(gracePeriod))
                .to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("judge()", () => {
        it("Should judge and return correct condition when called by owner", async function() {
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

        it("Should revert when trusteeIds and trustee address are not match", async function() {
            await expect(oracle.connect(alice).judge(true, 0))
                .to.be.revertedWith("Oracle: must be called by trustees with correct trusteeId");
            
            await expect(oracle.connect(trustee1).judge(true, 0))
                .to.be.revertedWith("Oracle: must be called by trustees with correct trusteeId");
            
            await expect(oracle.connect(owner).judge(true, 0))
                .to.be.revertedWith("Oracle: must be called by trustees with correct trusteeId");
        })

        it("Should revert when opinion is same", async function() {
            await expect(oracle.connect(trustee0).judge(false, 0))
                .to.be.revertedWith("Oracle: must be called with different opinion");
            
            await expect(oracle.connect(trustee0).judge(true, 0))
                .to.emit(oracle, "Judged")
                .withArgs(trustee0.address, true);
            
            await expect(oracle.connect(trustee0).judge(true, 0))
                .to.be.revertedWith("Oracle: must be called with different opinion");
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
    
        it("Should not return fulfillment time other than just when condition counter reachs numerator", async function() {
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

    describe("claim20()", () => {
        let token20A: Contract;
        let token20B: Contract;
        let token20C: Contract;
        let token20Addresses: string[];
        let amounts: BigNumber[];

        beforeEach(async function() {
            const tokenFixture = await token20Fixture(
                owner,
                BigNumber.from(100)
            );

            token20A = tokenFixture.token20A;
            token20B = tokenFixture.token20B;
            token20C = tokenFixture.token20C;

            token20Addresses = [
                token20A.address,
                token20B.address,
                token20C.address
            ];
            amounts = [
                BigNumber.from(10),
                BigNumber.from(20),
                BigNumber.from(30)
            ]

            await token20A.connect(owner).approve(oracle.address, 10);
            await token20B.connect(owner).approve(oracle.address, 20);
            await token20C.connect(owner).approve(oracle.address, 30);
        })

        it("Should transfer ERC20 tokens when the receiver calls after fulfillmentTime and gracePeriod have passed", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [115]);

            await expect(oracle.connect(receiver0).claim20(
                token20Addresses,
                alice.address,
                amounts
            )
                ).to.emit(token20A, "Transfer")
                .withArgs(owner.address, alice.address, 10)
                .to.emit(token20B, "Transfer")
                .withArgs(owner.address, alice.address, 20)
                .to.emit(token20C, "Transfer")
                .withArgs(owner.address, alice.address, 30);
        })

        it("Should revert when length of tokens is not same as amounts", async function() {
            await expect(oracle.connect(alice).claim20(
                token20Addresses,
                alice.address,
                [BigNumber.from(10), BigNumber.from(20)]
            )
                ).to.be.revertedWith("Oracle: must have same length of tokens and amounts");
        })

        it("Should revert when called by other than receiver", async function() {
            await expect(oracle.connect(alice).claim20(
                token20Addresses,
                alice.address,
                amounts
            )
                ).to.be.revertedWith("Oracle: must be called by receiver");
        })

        it("Should revert when called before condition is not fulfilled", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);

            await expect(oracle.connect(receiver0).claim20(
                token20Addresses,
                alice.address,
                amounts
            )
                ).to.be.revertedWith("Oracle: must be called after Condition is fulfilled");
        })

        it("Should revert when called before fulfillmentTime", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [15]);

            await expect(oracle.connect(receiver0).claim20(
                token20Addresses,
                alice.address,
                amounts
            )
                ).to.be.revertedWith("Oracle: must be called after grace period has passed");
        })

        it("Should revert if allowance of owner to oracle is insufficient", async function() {
            const Token20 = await ethers.getContractFactory("ERC20Mock");
            const token20D = await Token20.deploy("Token20D", "T20D", owner.address, 100);
            await token20D.deployed();

            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [115]);

            await expect(oracle.connect(receiver0).claim20(
                token20Addresses,
                alice.address,
                [BigNumber.from(10), BigNumber.from(20), BigNumber.from(100030)]
            )
                ).to.be.revertedWith("ERC20: insufficient allowance");

            await expect(oracle.connect(receiver0).claim20(
                [token20A.address, token20D.address],
                alice.address,
                [BigNumber.from(10), BigNumber.from(10)]
            )
                ).to.be.revertedWith("ERC20: insufficient allowance");
        })

    })

    describe("claim721()", () => {
        let token721A: Contract;
        let token721B: Contract;
        let token721C: Contract;
        let token721Addresses: string[];
        let tokenIds: BigNumber[];

        beforeEach(async function() {
            tokenIds = [
                BigNumber.from(27),
                BigNumber.from(439),
                BigNumber.from(8156),
                BigNumber.from(73861)
            ];
            const tokenFixture = await token721Fixture(
                owner,
                tokenIds
            );

            token721A = tokenFixture.token721A;
            token721B = tokenFixture.token721B;
            token721C = tokenFixture.token721C;

            token721Addresses = [
                token721A.address,
                token721B.address,
                token721C.address,
                token721C.address
            ];

            await token721A.connect(owner).setApprovalForAll(oracle.address, true);
            await token721B.connect(owner).setApprovalForAll(oracle.address, true);
            await token721C.connect(owner).setApprovalForAll(oracle.address, true);
        })

        it("Should transfer ERC721 when the receiver calls after fulfillmentTime and gracePeriod have passed", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [115]);

            await expect(oracle.connect(receiver0).claim721(
                token721Addresses,
                alice.address,
                tokenIds
            )
                ).to.emit(token721A, "Transfer")
                .withArgs(owner.address, alice.address, 27)
                .to.emit(token721B, "Transfer")
                .withArgs(owner.address, alice.address, 439)
                .to.emit(token721C, "Transfer")
                .withArgs(owner.address, alice.address, 8156)
                .to.emit(token721C, "Transfer")
                .withArgs(owner.address, alice.address, 73861);
        })

        it("Should revert when length of tokens is not same as tokenIds", async function() {
            await expect(oracle.connect(receiver0).claim721(
                token721Addresses,
                alice.address,
                [BigNumber.from(27), BigNumber.from(439)]
            )
                ).to.be.revertedWith("Oracle: must have same length of tokens and tokenIds");
        })

        it("Should revert when called by other than receiver", async function() {
            await expect(oracle.connect(alice).claim721(
                token721Addresses,
                alice.address,
                tokenIds
            )
                ).to.be.revertedWith("Oracle: must be called by receiver");
        })

        it("Should revert when called before condition is not fulfilled", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);

            await expect(oracle.connect(receiver0).claim721(
                token721Addresses,
                alice.address,
                tokenIds
            )
                ).to.be.revertedWith("Oracle: must be called after Condition is fulfilled");
        })

        it("Should revert when called before fulfillmentTime", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [15]);

            await expect(oracle.connect(receiver0).claim721(
                token721Addresses,
                alice.address,
                tokenIds
            )
                ).to.be.revertedWith("Oracle: must be called after grace period has passed");
        })

        it("Should revert if one of tokens is not approval for all", async function() {
            await oracle.connect(trustee0).judge(true, 0);
            await oracle.connect(trustee1).judge(true, 1);
            await oracle.connect(trustee2).judge(true, 2);

            await ethers.provider.send("evm_increaseTime", [115]);

            await token721A.connect(owner).setApprovalForAll(oracle.address, false);

            await expect(oracle.connect(receiver0).claim721(
                token721Addresses,
                alice.address,
                tokenIds
            )
                ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
        })
    })
})