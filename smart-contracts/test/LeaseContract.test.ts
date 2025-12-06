import { expect } from "chai";
import { ethers } from "hardhat";

describe("LeaseContract", function () {
  it("registers a new lease and stores metadata", async () => {
    const [owner, tenant] = await ethers.getSigners();

    const LeaseContract = await ethers.getContractFactory("LeaseContract");
    const leaseContract = await LeaseContract.deploy();
    await leaseContract.waitForDeployment();

    const leaseId = ethers.keccak256(ethers.toUtf8Bytes("LEASE-001"));
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600 * 24 * 365;

    await expect(
      leaseContract
        .connect(owner)
        .registerLease(leaseId, tenant.address, start, end)
    ).to.not.be.reverted;

    const lease = await leaseContract.getLease(leaseId);
    expect(lease.leaseId).to.equal(leaseId);
    expect(lease.tenant).to.equal(tenant.address);
  });

  it("only owner can register or modify leases", async () => {
    const [owner, tenant, outsider] = await ethers.getSigners();

    const LeaseContract = await ethers.getContractFactory("LeaseContract");
    const leaseContract = await LeaseContract.deploy();
    await leaseContract.waitForDeployment();

    const leaseId = ethers.keccak256(ethers.toUtf8Bytes("LEASE-002"));
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600 * 24 * 365;

    await expect(
      leaseContract
        .connect(outsider)
        .registerLease(leaseId, tenant.address, start, end)
    ).to.be.revertedWithCustomError(
      leaseContract,
      "OwnableUnauthorizedAccount"
    );

    await leaseContract
      .connect(owner)
      .registerLease(leaseId, tenant.address, start, end);

    await expect(
      leaseContract
        .connect(outsider)
        .setLeaseStatus(leaseId, 2) // Expired
    ).to.be.revertedWithCustomError(
      leaseContract,
      "OwnableUnauthorizedAccount"
    );
  });

  it("updates status and term of lease", async () => {
    const [owner, tenant] = await ethers.getSigners();

    const LeaseContract = await ethers.getContractFactory("LeaseContract");
    const leaseContract = await LeaseContract.deploy();
    await leaseContract.waitForDeployment();

    const leaseId = ethers.keccak256(ethers.toUtf8Bytes("LEASE-003"));
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600 * 24 * 365;

    await leaseContract
      .connect(owner)
      .registerLease(leaseId, tenant.address, start, end);

    // set status to Expired (1=None, 1=Active, 2=Expired, 3=Terminated in enum)
    await leaseContract.connect(owner).setLeaseStatus(leaseId, 2);
    const status = await leaseContract.getLeaseStatus(leaseId);
    expect(status).to.equal(2);

    const newStart = start + 3600;
    const newEnd = end + 3600;

    await leaseContract
      .connect(owner)
      .updateLeaseTerm(leaseId, newStart, newEnd);

    const updated = await leaseContract.getLease(leaseId);
    expect(updated.startTimestamp).to.equal(newStart);
    expect(updated.endTimestamp).to.equal(newEnd);
  });
});
