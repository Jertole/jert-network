
import { ethers } from "hardhat";
import { expect } from "chai";

describe("TreasuryMultisig", () => {
  it("stores owners and threshold correctly", async () => {
    const [o1, o2, o3, extra] = await ethers.getSigners();

    const owners = [o1.address, o2.address, o3.address];
    const threshold = 2;

    const Multisig = await ethers.getContractFactory("TreasuryMultisig");
    const multisig = await Multisig.deploy(owners, threshold);
    await multisig.deployed();

    const storedOwners: string[] = await multisig.getOwners();
    const storedThreshold: bigint = await multisig.threshold();

    expect(storedOwners).to.deep.equal(owners);
    expect(Number(storedThreshold)).to.equal(threshold);

    // isOwner должен правильно определять владельцев
    expect(await multisig.isOwner(o1.address)).to.equal(true);
    expect(await multisig.isOwner(o2.address)).to.equal(true);
    expect(await multisig.isOwner(o3.address)).to.equal(true);
    expect(await multisig.isOwner(extra.address)).to.equal(false);
  });

  it("reverts on invalid params", async () => {
    const [o1, o2] = await ethers.getSigners();
    const ownersTooFew = [o1.address, o2.address];

    const Multisig = await ethers.getContractFactory("TreasuryMultisig");

    // меньше 3 владельцев — ошибка
    await expect(
      Multisig.deploy(ownersTooFew, 2)
    ).to.be.revertedWith("Need at least 3 owners");

    // threshold > owners.length — ошибка
    const ownersOk = [o1.address, o2.address, o2.address];
    await expect(
      Multisig.deploy(ownersOk, 4)
    ).to.be.revertedWith("Invalid threshold");
  });
});
