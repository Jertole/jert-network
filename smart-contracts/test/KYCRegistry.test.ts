
import { expect } from "chai";
import { ethers } from "hardhat";

describe("KYCRegistry", function () {
  it("owner can set and batch-set allowed addresses", async () => {
    const [owner, userA, userB] = await ethers.getSigners();

    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    const registry = await KYCRegistry.deploy();
    await registry.waitForDeployment();

    await expect(registry.connect(owner).setAllowed(userA.address, true))
      .to.not.be.reverted;

    expect(await registry.isAllowed(userA.address)).to.equal(true);

    await registry
      .connect(owner)
      .setAllowedBatch(
        [userA.address, userB.address],
        [false, true]
      );

    expect(await registry.isAllowed(userA.address)).to.equal(false);
    expect(await registry.isAllowed(userB.address)).to.equal(true);
  });

  it("non-owner cannot change KYC flags", async () => {
    const [owner, userA, outsider] = await ethers.getSigners();

    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    const registry = await KYCRegistry.deploy();
    await registry.waitForDeployment();

    await expect(
      registry.connect(outsider).setAllowed(userA.address, true)
    ).to.be.revertedWithCustomError(
      registry,
      "OwnableUnauthorizedAccount"
    );
  });
});
