import { expect } from "chai";
import { ethers } from "hardhat";

describe("LeaseContract", () => {
  async function deployFixture() {
    const [owner, tenant, other] = await ethers.getSigners();
    const Lease = await ethers.getContractFactory("LeaseContract");
    const lease = await Lease.deploy();
    await lease.waitForDeployment();

    return { owner, tenant, other, lease };
  }

  function randomLeaseId() {
    return ethers.keccak256(ethers.toUtf8Bytes("lease-" + Date.now().toString()));
  }

  it("владелец может зарегистрировать новый lease", async () => {
    const { owner, tenant, lease } = await deployFixture();

    const leaseId = randomLeaseId();
    const totalAmount = ethers.parseUnits("10000", 18);
    const now = Math.floor(Date.now() / 1000);
    const start = now;
    const end = now + 3600 * 24 * 365; // +1 год

    await expect(
      lease
        .connect(owner)
        .registerLease(leaseId, tenant.address, start, end, totalAmount)
    )
      .to.emit(lease, "LeaseRegistered")
      .withArgs(leaseId, tenant.address, start, end, totalAmount);

    const saved = await lease.getLease(leaseId);
    expect(saved.leaseId).to.equal(leaseId);
    expect(saved.tenant).to.equal(tenant.address);
    expect(saved.totalAmount).to.equal(totalAmount);
  });

  it("двойная регистрация одного leaseId должна падать", async () => {
    const { owner, tenant, lease } = await deployFixture();

    const leaseId = randomLeaseId();
    const totalAmount = ethers.parseUnits("10000", 18);

    await lease
      .connect(owner)
      .registerLease(leaseId, tenant.address, 0, 0, totalAmount);

    await expect(
      lease
        .connect(owner)
        .registerLease(leaseId, tenant.address, 0, 0, totalAmount)
    ).to.be.revertedWith("Lease: already exists");
  });

  it("recordPayment накапливает paidAmount и может переводить в Completed", async () => {
    const { owner, tenant, lease } = await deployFixture();

    const leaseId = randomLeaseId();
    const totalAmount = ethers.parseUnits("1000", 18);

    await lease
      .connect(owner)
      .registerLease(leaseId, tenant.address, 0, 0, totalAmount);

    // первая частичная оплата
    const half = totalAmount / 2n;
    await lease.connect(owner).recordPayment(leaseId, half);

    let stored = await lease.getLease(leaseId);
    expect(stored.paidAmount).to.equal(half);
    expect(stored.status).to.equal(1); // Active

    // вторая оплата доводит до полного
    await lease.connect(owner).recordPayment(leaseId, totalAmount - half);

    stored = await lease.getLease(leaseId);
    expect(stored.paidAmount).to.equal(totalAmount);
    // Completed == 4 (Inactive=0 Active=1 Suspended=2 Terminated=3 Completed=4)
    expect(stored.status).to.equal(4);
  });

  it("только владелец может менять статус", async () => {
    const { owner, tenant, other, lease } = await deployFixture();

    const leaseId = randomLeaseId();

    await lease
      .connect(owner)
      .registerLease(leaseId, tenant.address, 0, 0, 0);

    // смена статуса владельцем
    await lease
      .connect(owner)
      .setLeaseStatus(leaseId, 2); // Suspended

    const stored = await lease.getLease(leaseId);
    expect(stored.status).to.equal(2);

    await expect(
      lease.connect(other).setLeaseStatus(leaseId, 3)
    ).to.be.revertedWithCustomError(lease, "OwnableUnauthorizedAccount");
  });
});
