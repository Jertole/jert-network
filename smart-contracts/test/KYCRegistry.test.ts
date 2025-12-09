
import { expect } from "chai";
import { ethers } from "hardhat";

describe("KYCRegistry", () => {
  async function deployKYCFixture() {
    const [owner, alice, bob, charlie] = await ethers.getSigners();
    const KYC = await ethers.getContractFactory("KYCRegistry");
    const kyc = await KYC.deploy();
    await kyc.waitForDeployment();

    return { kyc, owner, alice, bob, charlie };
  }

  it("только владелец может менять статус", async () => {
    const { kyc, owner, alice, bob } = await deployKYCFixture();

    await expect(kyc.connect(owner).setKYCStatus(alice.address, true))
      .to.emit(kyc, "KYCStatusUpdated")
      .withArgs(alice.address, true);

    // не-владелец
    await expect(
      kyc.connect(bob).setKYCStatus(alice.address, false)
    ).to.be.revertedWithCustomError(kyc, "OwnableUnauthorizedAccount");
  });

  it("batch-set должен работать и обновлять статусы", async () => {
    const { kyc, owner, alice, bob, charlie } = await deployKYCFixture();

    await kyc
      .connect(owner)
      .setKYCStatusBatch(
        [alice.address, bob.address, charlie.address],
        [true, false, true]
      );

    expect(await kyc.isAllowed(alice.address)).to.equal(true);
    expect(await kyc.isAllowed(bob.address)).to.equal(false);
    expect(await kyc.isAllowed(charlie.address)).to.equal(true);
  });

  it("batch-set с разной длиной массивов должен падать", async () => {
    const { kyc, owner, alice, bob } = await deployKYCFixture();

    await expect(
      kyc
        .connect(owner)
        .setKYCStatusBatch([alice.address, bob.address], [true])
    ).to.be.revertedWith("KYC: length mismatch");
  });
});
