import { ethers } from "hardhat";
import { expect } from "chai";

describe("JERTToken", () => {
  it("mints full supply to treasury and sets owner", async () => {
    const [treasury, someoneElse] = await ethers.getSigners();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.deployed();

    const MAX_SUPPLY = await jert.MAX_SUPPLY();
    const totalSupply = await jert.totalSupply();
    const treasuryBalance = await jert.balanceOf(treasury.address);

    expect(totalSupply).to.equal(MAX_SUPPLY);
    expect(treasuryBalance).to.equal(MAX_SUPPLY);

    // Ownable: owner should be treasury
    const owner = await jert.owner();
    expect(owner).to.equal(treasury.address);

    // someoneElse не может менять ownership
    await expect(
      jert.connect(someoneElse).transferOwnership(someoneElse.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
