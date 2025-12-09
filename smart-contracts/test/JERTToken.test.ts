
import { expect } from "chai";
import { ethers } from "hardhat";

describe("JERTToken", () => {
  async function deployTokenFixture() {
    const [deployer, treasury, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("JERTToken");
    const token = await Token.deploy(treasury.address);
    await token.waitForDeployment();

    return { token, deployer, treasury, user };
  }

  it("должен корректно инициализироваться (name, symbol, decimals, maxSupply)", async () => {
    const { token, treasury } = await deployTokenFixture();

    expect(await token.name()).to.equal("JERT Utility Token");
    expect(await token.symbol()).to.equal("JERT");
    expect(await token.decimals()).to.equal(18);

    const totalSupply = await token.totalSupply();
    const maxSupply = ethers.parseUnits("1000000000000", 18); // 1 триллион JERT

    expect(totalSupply).to.equal(maxSupply);
    expect(await token.balanceOf(treasury.address)).to.equal(maxSupply);
  });

  it("только владелец может минтить", async () => {
    const { token, deployer, user } = await deployTokenFixture();

    const amount = ethers.parseUnits("1000", 18);

    // владелец может минтить
    await expect(token.connect(deployer).mint(user.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, user.address, amount);

    // не-владелец не может
    await expect(
      token.connect(user).mint(user.address, amount)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("не должен превышать MAX_SUPPLY при минте", async () => {
    const { token, deployer } = await deployTokenFixture();

    const maxSupply = await token.MAX_SUPPLY();
    const currentSupply = await token.totalSupply();
    const remaining = maxSupply - currentSupply;

    // минтим ровно до капа — ок
    if (remaining > 0n) {
      await token.connect(deployer).mint(deployer.address, remaining);
      expect(await token.totalSupply()).to.equal(maxSupply);
    }

    // любая дополнительная попытка — revert
    await expect(
      token.connect(deployer).mint(deployer.address, 1n)
    ).to.be.revertedWith("JERT: cap exceeded");
  });

  it("только владелец может жечь токены", async () => {
    const { token, deployer, treasury, user } = await deployTokenFixture();

    const amount = ethers.parseUnits("10", 18);

    // жём с баланса treasury как владелец
    await expect(
      token.connect(deployer).burn(treasury.address, amount)
    )
      .to.emit(token, "Transfer")
      .withArgs(treasury.address, ethers.ZeroAddress, amount);

    // пользователь не может вызвать burn
    await expect(
      token.connect(user).burn(treasury.address, amount)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });
});
