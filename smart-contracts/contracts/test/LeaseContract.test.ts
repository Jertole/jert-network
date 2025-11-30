import { ethers } from "hardhat";
import { expect } from "chai";

describe("LeaseContract", () => {
  async function deployAll() {
    const [deployer, treasury, lessee] = await ethers.getSigners();

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

    return { deployer, treasury, lessee, kyc, jert, lease };
  }

  it("reverts createLease if lessee has no KYC (ComplianceGateway check)", async () => {
    const { lease, lessee } = await deployAll();

    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now + 30 * 24 * 60 * 60; // +30 days

    await expect(
      lease.createLease(lessee.address, ethers.parseUnits("1000", 18), start, end)
    ).to.be.revertedWith("KYC not completed");
  });

  it("creates lease and accepts payments when KYC is passed", async () => {
    const { treasury, lessee, kyc, jert, lease } = await deployAll();

    // включаем KYC для lessee
    await kyc.setKYCStatus(lessee.address, true);

    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now

