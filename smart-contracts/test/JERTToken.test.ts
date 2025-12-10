
import { ethers } from "hardhat";
import { expect } from "chai";

describe("JERTToken", () => {
  async function deployJERT() {
    const [treasury, someoneElse] = await ethers.getSigners();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.waitForDeployment();

    return { jert, treasury, someoneElse };
  }

  it("mints full supply to treasury and sets owner", async () => {
    const { jert, treasury, someoneElse } = await deployJERT();

    const MAX_SUPPLY = await jert.MAX_SUPPLY();
    const totalSupply = await jert.totalSupply();
    const treasuryBalance = await jert.balanceOf(treasury.address);

    expect(totalSupply).to.equal(MAX_SUPPLY);
    expect(treasuryBalance).to.equal(MAX_SUPPLY);

    // Ownable: owner должен быть treasury
    const owner = await jert.owner();
    expect(owner).to.equal(treasury.address);

    // someoneElse не может менять ownership
    await expect(
      jert.connect(someoneElse).transferOwnership(someoneElse.address)
    )
      .to.be.revertedWithCustomError(jert, "OwnableUnauthorizedAccount")
      .withArgs(someoneElse.address);
  });

  it("only owner can mint", async () => {
    const { jert, treasury, someoneElse } = await deployJERT();

    // 1) non-owner → должен словить OwnableUnauthorizedAccount
    await expect(
      jert.connect(someoneElse).mint(someoneElse.address, 1n)
    )
      .to.be.revertedWithCustomError(jert, "OwnableUnauthorizedAccount")
      .withArgs(someoneElse.address);

    // 2) owner ПЫТАЕТСЯ минтить, но кап уже исчерпан → любая попытка минта ревертится
    await expect(
      jert.connect(treasury).mint(someoneElse.address, 1n)
    ).to.be.reverted;
  });

  it("does not exceed MAX_SUPPLY on mint", async () => {
    const { jert, treasury } = await deployJERT();

    const MAX_SUPPLY = await jert.MAX_SUPPLY();
    const totalSupplyBefore = await jert.totalSupply();
    expect(totalSupplyBefore).to.equal(MAX_SUPPLY);

    // Любая попытка минтить сверх капа должна ревертиться
    await expect(
      jert.connect(treasury).mint(treasury.address, 1n)
    ).to.be.reverted;

    const totalSupplyAfter = await jert.totalSupply();
    expect(totalSupplyAfter).to.equal(MAX_SUPPLY);
  });

  it("only owner can burn tokens", async () => {
    const { jert, treasury, someoneElse } = await deployJERT();

    // non-owner пытается жечь — должен быть OwnableUnauthorizedAccount
    await expect(
      jert.connect(someoneElse).burn(treasury.address, 1n)
    )
      .to.be.revertedWithCustomError(jert, "OwnableUnauthorizedAccount")
      .withArgs(someoneElse.address);

    // owner может жечь
    const balanceBefore = await jert.balanceOf(treasury.address);

    await expect(
      jert.connect(treasury).burn(treasury.address, 1n)
    ).to.not.be.reverted;

    const balanceAfter = await jert.balanceOf(treasury.address);
    expect(balanceAfter).to.equal(balanceBefore - 1n);
  });
});
