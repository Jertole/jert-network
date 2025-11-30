
import { ethers } from "hardhat";
import { expect } from "chai";

describe("ComplianceGateway via LeaseContract", () => {
  async function deployEnv() {
    const [deployer, treasury, user, attacker] = await ethers.getSigners();

    const KYC = await ethers.getContractFactory("KYCRegistry");
    const kyc = await KYC.deploy();
    await kyc.deployed();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.deployed();

    const Lease = await ethers.getContractFactory("LeaseContract");
    const lease = await Lease.deploy(
      await jert.getAddress(),
      await kyc.getAddress(),
      treasury.address
    );
    await lease.deployed();

    return { treasury, user, attacker, kyc, jert, lease };
  }

  it("blocks non-KYC user from creating lease", async () => {
    const { lease, user } = await deployEnv();

    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now + 7 * 24 * 60 * 60;

    await expect(
      lease.createLease(user.address, ethers.parseUnits("100", 18), start, end)
    ).to.be.revertedWith("KYC not completed");
  });

  it("allows KYC-passed user to create lease", async () => {
    const { lease, user, kyc } = await deployEnv();

    await kyc.setKYCStatus(user.address, true);

    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now + 7 * 24 * 60 * 60;

    await expect(
      lease.createLease(user.address, ethers.parseUnits("100", 18), start, end)
    ).to.not.be.reverted;
  });

  it("blocks non-KYC payer from paying for lease", async () => {
    const { treasury, user, attacker, kyc, jert, lease } = await deployEnv();

    // user прошёл KYC и создаёт лизинг
    await kyc.setKYCStatus(user.address, true);

    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now + 7 * 24 * 60 * 60;
    const leaseAmount = ethers.parseUnits("100", 18);

    await lease.createLease(user.address, leaseAmount, start, end);
    const leaseId = await lease.nextLeaseId();

    // казначейство переводит токены attacker'у
    await jert.connect(treasury).transfer(attacker.address, leaseAmount);
    await jert.connect(attacker).approve(await lease.getAddress(), leaseAmount);

    // attacker не имеет KYC → должен получить revert
    await expect(
      lease.connect(attacker).payLease(leaseId, leaseAmount)
    ).to.be.revertedWith("KYC not completed");
  });
});
