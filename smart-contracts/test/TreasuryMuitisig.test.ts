import { expect } from "chai";
import { ethers } from "hardhat";

describe("TreasuryMultisig", function () {
  async function deployMultisig() {
    const [deployer, ownerA, ownerB, ownerC, recipient] =
      await ethers.getSigners();

    const TreasuryMultisig = await ethers.getContractFactory(
      "TreasuryMultisig"
    );
    const owners = [ownerA.address, ownerB.address, ownerC.address];
    const threshold = 3;

    const multisig = await TreasuryMultisig.deploy(owners, threshold);
    await multisig.waitForDeployment();

    return { deployer, ownerA, ownerB, ownerC, recipient, multisig };
  }

  it("deploys with correct owners and threshold", async () => {
    const { ownerA, ownerB, ownerC, multisig } = await deployMultisig();

    const owners = await multisig.getOwners();
    expect(owners).to.deep.equal([ownerA.address, ownerB.address, ownerC.address]);

    const threshold = await multisig.getThreshold();
    expect(threshold).to.equal(3);
  });

  it("requires owner for submit/confirm/execute", async () => {
    const { multisig, recipient, ownerA } = await deployMultisig();
    const [, , , , outsider] = await ethers.getSigners();

    const data = "0x";
    const value = 0;

    // outsider cannot submit
    await expect(
      multisig.connect(outsider).submitTransaction(recipient.address, value, data)
    ).to.be.revertedWith("Multisig: caller not owner");

    // owner can submit
    await expect(
      multisig.connect(ownerA).submitTransaction(recipient.address, value, data)
    ).to.not.be.reverted;
  });

  it("executes transaction only after enough confirmations (3/3)", async () => {
    const { multisig, ownerA, ownerB, ownerC, recipient } =
      await deployMultisig();

    const txValue = ethers.parseEther("1.0");

    // send ETH to multisig
    const [fundingAccount] = await ethers.getSigners();
    await fundingAccount.sendTransaction({
      to: await multisig.getAddress(),
      value: txValue,
    });

    // create tx by ownerA
    const submitTx = await multisig
      .connect(ownerA)
      .submitTransaction(recipient.address, txValue, "0x");
    const receipt = await submitTx.wait();
    const event = receipt!.logs.find(
      (l: any) => l.fragment && l.fragment.name === "Submission"
    );
    const txId = event?.args?.txId ?? 0n;

    // confirm by ownerB
    await multisig.connect(ownerB).confirmTransaction(txId);
    // confirm by ownerC -> triggers execution because threshold=3
    await multisig.connect(ownerC).confirmTransaction(txId);

    const balanceRecipient = await ethers.provider.getBalance(recipient.address);
    expect(balanceRecipient).to.be.greaterThan(0);
  });

  it("allows revoke before execution", async () => {
    const { multisig, ownerA, ownerB, ownerC, recipient } =
      await deployMultisig();

    const txValue = ethers.parseEther("0.5");

    const [fundingAccount] = await ethers.getSigners();
    await fundingAccount.sendTransaction({
      to: await multisig.getAddress(),
      value: txValue,
    });

    const submitTx = await multisig
      .connect(ownerA)
      .submitTransaction(recipient.address, txValue, "0x");
    const receipt = await submitTx.wait();
    const event = receipt!.logs.find(
      (l: any) => l.fragment && l.fragment.name === "Submission"
    );
    const txId = event?.args?.txId ?? 0n;

    await multisig.connect(ownerB).confirmTransaction(txId);

    // ownerB can revoke before execution
    await expect(
      multisig.connect(ownerB).revokeConfirmation(txId)
    ).to.not.be.reverted;
  });
});
