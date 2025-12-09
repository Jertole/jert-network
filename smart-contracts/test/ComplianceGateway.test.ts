
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ComplianceGateway", () => {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();

    const KYC = await ethers.getContractFactory("KYCRegistry");
    const kyc = await KYC.deploy();
    await kyc.waitForDeployment();

    const Gateway = await ethers.getContractFactory("ComplianceGateway");
    const gateway = await Gateway.deploy(await kyc.getAddress());
    await gateway.waitForDeployment();

    return { owner, user, kyc, gateway };
  }

  it("по умолчанию пользователь не разрешён", async () => {
    const { user, gateway } = await deployFixture();

    expect(await gateway.isAllowed(user.address)).to.equal(false);

    await expect(gateway.requireSenderAllowed()).to.be.revertedWith(
      "Gateway: account not allowed"
    );

    await expect(
      gateway.requireAccountAllowed(user.address)
    ).to.be.revertedWith("Gateway: account not allowed");
  });

  it("после KYC-аппрува пользователь становится allowed", async () => {
    const { owner, user, kyc, gateway } = await deployFixture();

    // owner KYCRegistry == deployer контракта
    await kyc.connect(owner).setKYCStatus(user.address, true);

    expect(await gateway.isAllowed(user.address)).to.equal(true);

    // requireAccountAllowed теперь не должен падать
    await gateway.requireAccountAllowed(user.address);
  });

  it("смена адреса KYCRegistry доступна только владельцу", async () => {
    const { gateway, user } = await deployFixture();

    const KYC2 = await ethers.getContractFactory("KYCRegistry");
    const kyc2 = await KYC2.deploy();
    await kyc2.waitForDeployment();

    await expect(
      gateway.connect(user).setKYCRegistry(await kyc2.getAddress())
    ).to.be.revertedWithCustomError(gateway, "OwnableUnauthorizedAccount");
  });
});
