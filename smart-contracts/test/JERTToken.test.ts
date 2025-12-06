
import { expect } from "chai";
import { ethers } from "hardhat";

describe("JERTToken", function () {
  const NAME = "JERT Utility Token";
  const SYMBOL = "JERT";
  const DECIMALS = 18;

  it("deploys with correct name, symbol and decimals", async () => {
    const [treasury] = await ethers.getSigners();

    const JERTToken = await ethers.getContractFactory("JERTToken");
    const initialSupply = ethers.parseUnits("1000000000", DECIMALS);

    const token = await JERTToken.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      treasury.address,
      initialSupply
    );

    await token.waitForDeployment();

    expect(await token.name()).to.equal(NAME);
    expect(await token.symbol()).to.equal(SYMBOL);
    expect(await token.decimals()).to.equal(DECIMALS);

    const balance = await token.balanceOf(treasury.address);
    expect(balance).to.equal(initialSupply);
  });

  it("only owner can mint and burn", async () => {
    const [treasury, owner2, other] = await ethers.getSigners();

    const JERTToken = await ethers.getContractFactory("JERTToken");
    const initialSupply = 0n;

    const token = await JERTToken.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      treasury.address,
      initialSupply
    );
    await token.waitForDeployment();

    // owner (deployer) by default = treasury in constructor
    await expect(
      token.connect(treasury).mint(owner2.address, ethers.parseUnits("1000", DECIMALS))
    ).to.not.be.reverted;

    const balOwner2 = await token.balanceOf(owner2.address);
    expect(balOwner2).to.equal(ethers.parseUnits("1000", DECIMALS));

    // non-owner cannot mint
    await expect(
      token.connect(other).mint(other.address, 1)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

    // owner can burn
    await expect(
      token.connect(treasury).burn(owner2.address, ethers.parseUnits("500", DECIMALS))
    ).to.not.be.reverted;

    const balAfterBurn = await token.balanceOf(owner2.address);
    expect(balAfterBurn).to.equal(ethers.parseUnits("500", DECIMALS));

    // non-owner cannot burn
    await expect(
      token.connect(other).burn(owner2.address, 1)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("standard ERC20 transfers work", async () => {
    const [treasury, userA, userB] = await ethers.getSigners();

    const JERTToken = await ethers.getContractFactory("JERTToken");
    const token = await JERTToken.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      treasury.address,
      ethers.parseUnits("1000000", DECIMALS)
    );
    await token.waitForDeployment();

    // transfer from treasury to userA
    await token
      .connect(treasury)
      .transfer(userA.address, ethers.parseUnits("1000", DECIMALS));

    expect(await token.balanceOf(userA.address)).to.equal(
      ethers.parseUnits("1000", DECIMALS)
    );

    // userA approves userB
    await token
      .connect(userA)
      .approve(userB.address, ethers.parseUnits("500", DECIMALS));

    // userB transfers from userA
    await token
      .connect(userB)
      .transferFrom(
        userA.address,
        userB.address,
        ethers.parseUnits("300", DECIMALS)
      );

    expect(await token.balanceOf(userB.address)).to.equal(
      ethers.parseUnits("300", DECIMALS)
    );
    expect(await token.balanceOf(userA.address)).to.equal(
      ethers.parseUnits("700", DECIMALS)
    );
  });
});
