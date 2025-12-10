import { expect } from "chai";
import { ethers } from "hardhat";

describe("TreasuryMultisig", () => {
  async function deployFixture() {
    const [ownerA, ownerB, ownerC, nonOwner, recipient] =
      await ethers.getSigners();

    const owners = [ownerA.address, ownerB.address, ownerC.address];
    const required = 2; // 2-of-3 для теста

    const Multi = await ethers.getContractFactory("TreasuryMultisig");
    const multisig = await Multi.deploy(owners, required);
    await multisig.waitForDeployment();

    return { multisig, ownerA, ownerB, ownerC, nonOwner, recipient };
  }

  it("инициализируется с нужными владельцами и threshold", async () => {
    const { multisig, ownerA, ownerB, ownerC } = await deployFixture();

    expect(await multisig.isOwner(ownerA.address)).to.equal(true);
    expect(await multisig.isOwner(ownerB.address)).to.equal(true);
    expect(await multisig.isOwner(ownerC.address)).to.equal(true);
    expect(await multisig.getOwnersCount()).to.equal(3n);

    const required = await multisig.required();
    expect(required).to.equal(2n);
  });

  it("депозит ETH увеличивает баланс и эмитит событие", async () => {
    const { multisig, ownerA } = await deployFixture();

    await expect(
      ownerA.sendTransaction({
        to: await multisig.getAddress(),
        value: ethers.parseEther("1.0"),
      })
    )
      .to.emit(multisig, "Deposit")
      .withArgs(ownerA.address, ethers.parseEther("1.0"));

    const balance = await ethers.provider.getBalance(
      await multisig.getAddress()
    );
    expect(balance).to.equal(ethers.parseEther("1.0"));
  });

  it("non-owner не может создавать транзакции", async () => {
    const { multisig, nonOwner } = await deployFixture();

    await expect(
      multisig
        .connect(nonOwner)
        .submitTransaction(nonOwner.address, 0, "0x")
    ).to.be.revertedWith("Multisig: not owner");
  });

  it("2-of-3 подтверждения достаточно для исполнения транзакции", async () => {
    const { multisig, ownerA, ownerB, recipient } = await deployFixture();

    // Закинем ETH в multisig
    await ownerA.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("2"),
    });

    const recipientStart = await ethers.provider.getBalance(recipient.address);

    // submitTransaction от ownerA (автоматически создаёт запись с id = 0)
    const txValue = ethers.parseEther("1");
    const txData = "0x";

    await multisig
      .connect(ownerA)
      .submitTransaction(recipient.address, txValue, txData);

    // Поскольку это первая транзакция в свежем контракте — её id = 0
    const txId = 0n;

    // ownerB даёт второе подтверждение → должно привести к выполнению
    await expect(
      multisig.connect(ownerB).confirmTransaction(txId)
    ).to.emit(multisig, "Execution");

    const recipientEnd = await ethers.provider.getBalance(recipient.address);
    expect(recipientEnd - recipientStart).to.equal(txValue);
  });

  it("нельзя выполнить транзакцию без достаточных подтверждений", async () => {
    const { multisig, ownerA, recipient } = await deployFixture();

    await ownerA.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("1"),
    });

    const txValue = ethers.parseEther("0.5");

    await multisig
      .connect(ownerA)
      .submitTransaction(recipient.address, txValue, "0x");

    // первая и единственная транзакция → id = 0
    const txId = 0n;

    // попытка execute при 1 подтверждении должна падать
    await expect(
      multisig.connect(ownerA).executeTransaction(txId)
    ).to.be.revertedWith("Multisig: not enough confirmations");
  });
});
