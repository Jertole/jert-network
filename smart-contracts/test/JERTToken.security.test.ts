import { ethers } from "hardhat";
import { expect } from "chai";

function hasMethod(contract: any, name: string): boolean {
  return typeof contract?.[name] === "function";
}

describe("JERTToken – security baseline", function () {
  it("mints full MAX_SUPPLY to treasury and locks mint (if mint exists)", async function () {
    const [treasury, user] = await ethers.getSigners();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.waitForDeployment();

    const maxSupply = await jert.MAX_SUPPLY();
    const totalSupply = await jert.totalSupply();
    const treasuryBal = await jert.balanceOf(treasury.address);

    expect(totalSupply).to.equal(maxSupply);
    expect(treasuryBal).to.equal(maxSupply);

    // If owner() exists, ensure treasury owns it
    if (hasMethod(jert, "owner")) {
      const owner = await (jert as any).owner();
      expect(owner).to.equal(treasury.address);
    }

    // If mint exists, it must be restricted (should revert for non-treasury)
    if (hasMethod(jert, "mint")) {
      await expect((jert.connect(user) as any).mint(user.address, 1n)).to.be.reverted;
    }
  });

  it("pause/unpause: only treasury (owner) and transfers revert while paused (if pausable exists)", async function () {
    const [treasury, user] = await ethers.getSigners();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.waitForDeployment();

    // If pausable not present -> skip safely
    if (!hasMethod(jert, "pause") || !hasMethod(jert, "unpause")) {
      return;
    }

    // non-owner must fail
    await expect((jert.connect(user) as any).pause()).to.be.reverted;

    await (jert.connect(treasury) as any).pause();

    // transfer while paused should revert
    await expect(jert.connect(treasury).transfer(user.address, 1n)).to.be.reverted;

    await (jert.connect(treasury) as any).unpause();

    // after unpause transfer should succeed
    await expect(jert.connect(treasury).transfer(user.address, 1n)).to.not.be.reverted;
  });

  it("compliance hook: blocked/denied address cannot receive (if block/deny function exists)", async function () {
    const [treasury, user] = await ethers.getSigners();

    const JERT = await ethers.getContractFactory("JERTToken");
    const jert = await JERT.deploy(treasury.address);
    await jert.waitForDeployment();

    // Try common function names (no signatures), pick the first реально существующую
    const candidates = [
      "setBlocked",
      "setBlocklisted",
      "setBlacklisted",
      "setDenylisted",
      "setDenied"
    ];

    const methodName = candidates.find((n) => hasMethod(jert, n));
    if (!methodName) {
      // function name differs or compliance is wired differently -> skip safely
      return;
    }

    // Block user
    await expect((jert.connect(treasury) as any)[methodName](user.address, true)).to.not.be.reverted;

    // Transfer to blocked user should revert
    await expect(jert.connect(treasury).transfer(user.address, 1n)).to.be.reverted;

    // Unblock and transfer should succeed
    await expect((jert.connect(treasury) as any)[methodName](user.address, false)).to.not.be.reverted;
    await expect(jert.connect(treasury).transfer(user.address, 1n)).to.not.be.reverted;
  });
});
