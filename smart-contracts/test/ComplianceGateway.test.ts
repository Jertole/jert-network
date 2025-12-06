import { expect } from "chai";
import { ethers } from "hardhat";

describe("ComplianceGateway", function () {
  it("checks KYC registry and blocks non-allowed accounts", async () => {
    const [owner, userAllowed, userBlocked] = await ethers.getSigners();

    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    const registry = await KYCRegistry.deploy();
    await registry.waitForDeployment();

    const ComplianceGateway = await ethers.getContractFactory(
      "ComplianceGateway"
    );
    const gateway = await ComplianceGateway.deploy(await registry.getAddress());
    await gateway.waitForDeployment();

    // initially all false
    expect(await gateway.checkAllowed(userAllowed.address)).to.equal(false);

    // mark userAllowed as allowed
    await registry.connect(owner).setAllowed(userAllowed.address, true);

    expect(await gateway.checkAllowed(userAllowed.address)).to.equal(true);
    expect(await gateway.checkAllowed(userBlocked.address)).to.equal(false);

    // requireAllowed should revert for blocked user
    await expect(
      gateway.requireAllowed(userBlocked.address)
    ).to.be.revertedWith("Gateway: account not allowed");
  });

  it("only owner can update KYC registry address", async () => {
    const [owner, newRegistry, outsider] = await ethers.getSigners();

    const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
    const registry = await KYCRegistry.deploy();
    await registry.waitForDeployment();

    const ComplianceGateway = await ethers.getContractFactory(
      "ComplianceGateway"
    );
    const gateway = await ComplianceGateway.deploy(await registry.getAddress());
    await gateway.waitForDeployment();

    await expect(
      gateway
        .connect(outsider)
        .setKYCRegistry(newRegistry.address)
    ).to.be.revertedWithCustomError(
      gateway,
      "OwnableUnauthorizedAccount"
    );

    await expect(
      gateway
        .connect(owner)
        .setKYCRegistry(newRegistry.address)
    ).to.not.be.reverted;
  });
});
