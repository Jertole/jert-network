import { ethers } from "hardhat";
import { expect } from "chai";

describe("KYCRegistry", () => {
  it("owner can set KYC status", async () => {
    const [owner, user] = await ethers.getSigners();

    const KYC = await ethers.getContractFactory("KYCRegistry");
    const kyc = await KYC.deploy();
    await kyc.deployed();

    // по умолчанию статус false
    expect(await kyc.isKYCCompleted(user.address)).to.equal(false);

    // владелец ставит KYC = true
    await kyc.connect(owner).setKYCStatus(user.address, true);
    expect(await kyc.isKYCCompleted(user.address)).to.equal(true);

    // ставим обратно false
    await kyc.connect(owner).setKYCStatus(user.address, false);
    expect(await kyc.isKYCCompleted(user.address)).to.equal(false);
  });

  it("non-owner cannot set KYC status", async () => {
    const [owner, user, attacker] = await ethers.getSigners();

    const KYC = await ethers.getContractFactory("KYCRegistry");
    const kyc = await KYC.deploy();
    await kyc.deployed();

    await expect(
      kyc.connect(attacker).setKYCStatus(user.address, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
