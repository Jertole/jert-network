import { ethers } from "hardhat";
import { expect } from "chai";

describe("TreasuryMultisig", () => {
  async function deployMultisig() {
    const [o1, o2, o3, extra, recipient] = await ethers.getSigners();
    const owners = [o1.address, o2.address, o3.address];
    const threshold = 2;

    const Multisig = await ethers.getContractFactory("TreasuryMultisig");
    const multisig = await Multisig.deploy(owners, threshold);
    // await multisig.deployed(); // для ethers v5, для v6 не нужно

    return { multisig, o1, o2, o3, extra, recipient };
  }

  it("stores owners and threshold correctly", async () => {
    const { multisig, o1, o2, o3, extra } = await deployMultisig();

    const storedOwners: string[] = await multisig.getOwners();
    const storedThreshold: bigint = await multisig.threshold();

    expect(storedOwners).to.deep.equal([o1.address, o2.address, o3.address]);
    expect(Number(storedThreshold)).to.equal(2);

    expect(await multisig.isOwner(o1.address)).to.equal(true);
    expect(await multisig.isOwner(o2.address)).to.equal(true);
    expect(await multisig.isOwner(o3.address)).to.equal(true);
    expect(await multisig.isOwner(extra.address)).to.equal(false);
  });

  it("reverts on invalid params", async () => {
    const [o1, o2] = await ethers.getSigners();
    const Multisig = await ethers.getContractFactory("TreasuryMultisig");

    await expect(
      Multisig.deploy([o1.address, o2.address], 2)
    ).to.be.revertedWith("Need at least 3 owners");

    // threshold > owners.length
    const ownersOk = [o1.address, o2.address, o2.address];
    await expect(
      Multisig.deploy(ownersOk, 4)
    ).to.be.revertedWith("Invalid threshold");
  });

  it("allows owner to submit and execute tx after enough confirmations", async () => {
    const { multisig, o1, o2, recipient } = await deployMultisig();

    // отправим немного ETH на multisig
    await o1.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("1.0"),
    });

    // submit tx: send 0.5 ETH to recipient
    const value = ethers.parseEther("0.5");
    const tx = await multisig.connect(o1).submitTransaction(
      recipient.address,
      value,
      "0x"
    );
    const receipt = await tx.wait();
    const txId = (await multisig.getTransactionCount()) - 1n;

    // confirm by owner1
    await multisig.connect(o1).confirmTransaction(txId);
    // confirm by owner2 → должно авто-исполниться
    await multisig.connect(o2).confirmTransaction(txId);

    const stored = await multisig.transactions(txId);
    expect(stored.executed).to.equal(true);

    const recipientBalance = await ethers.provider.getBalance(recipient.address);
    // Проверяем, что хотя бы 0.5 ETH дошло (точное значение не важно из-за gas)
    expect(recipientBalance).to.be.gte(value);
  });

  it("prevents non-owners from submitting or confirming", async () => {
    const { multisig, extra, recipient } = await deployMultisig();

    await expect(
      multisig.connect(extra).submitTransaction(recipient.address, 0, "0x")
    ).to.be.revertedWith("Not owner");

    await expect(
      multisig.connect(extra).confirmTransaction(0)
    ).to.be.revertedWith("Not owner");
  });

  it("allows revokeConfirmation and blocks execution if below threshold", async () => {
    const { multisig, o1, o2, o3, recipient } = await deployMultisig();

    await o1.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("1.0"),
    });

    const value = ethers.parseEther("0.3");
    await multisig
      .connect(o1)
      .submitTransaction(recipient.address, value, "0x");
    const txId = (await multisig.getTransactionCount()) - 1n;

    await multisig.connect(o1).confirmTransaction(txId);
    await multisig.connect(o2).confirmTransaction(txId);

    // threshold=2 → уже достаточно, tx исполнится
    let stored = await multisig.transactions(txId);
    expect(stored.executed).to.equal(true);

    // новый tx для revoke сценария
    await multisig
      .connect(o1)
      .submitTransaction(recipient.address, value, "0x");
    const txId2 = (await multisig.getTransactionCount()) - 1n;

    await multisig.connect(o1).confirmTransaction(txId2);
    await multisig.connect(o2).confirmTransaction(txId2);

    // revoke одного подтверждения → tx не должен пройти manual execute
    await multisig.connect(o2).revokeConfirmation(txId2);

    stored = await multisig.transactions(txId2);
    expect(stored.executed).to.equal(false);
    await expect(
      multisig.connect(o3).executeTransaction(txId2)
    ).to.be.revertedWith("Not enough confirmations");
  });
});
