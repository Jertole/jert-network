import { ethers } from "hardhat";
import { expect } from "chai";

describe("TreasuryMultisig", () => {
  async function deployMultisig() {
    const [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();
    const owners = [owner1.address, owner2.address, owner3.address];
    const numConfirmationsRequired = 2;

    const Treasury = await ethers.getContractFactory("TreasuryMultisig");
    const multisig = await Treasury.deploy(owners, numConfirmationsRequired);
    await multisig.waitForDeployment();

    return {
      multisig,
      owners,
      owner1,
      owner2,
      owner3,
      nonOwner,
      numConfirmationsRequired,
    };
  }

  it("deploys with correct owners and required confirmations", async () => {
    const {
      multisig,
      owners,
      numConfirmationsRequired,
    } = await deployMultisig();

    const onChainOwners = await multisig.getOwners();
    expect(onChainOwners).to.deep.equal(owners);

    const required = await multisig.numConfirmationsRequired();
    expect(Number(required)).to.equal(numConfirmationsRequired);
  });

  it("allows only owners to submit transactions", async () => {
    const { multisig, owner1, nonOwner } = await deployMultisig();

    const to = nonOwner.address;
    const value = 0;
    const data = "0x";

    // владелец может сабмитить
    await expect(multisig.connect(owner1).submitTransaction(to, value, data))
      .to.emit(multisig, "SubmitTransaction");

    // не-владелец не может
    await expect(
      multisig.connect(nonOwner).submitTransaction(to, value, data)
    ).to.be.revertedWith("not owner");
  });

  it("requires enough confirmations to execute transaction", async () => {
    const {
      multisig,
      owner1,
      owner2,
      owner3,
      numConfirmationsRequired,
    } = await deployMultisig();

    // отправляем немного ETH на мультисиг, чтобы была с чем работать
    const [sender] = await ethers.getSigners();
    await sender.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("1"),
    });

    const to = owner3.address;
    const value = ethers.parseEther("0.5");
    const data = "0x";

    // submit tx
    await expect(
      multisig.connect(owner1).submitTransaction(to, value, data)
    ).to.emit(multisig, "SubmitTransaction");

    const txCount = await multisig.getTransactionCount();
    const txId = txCount - 1n; // последний tx

    // подтверждаем только одним владельцем — должно не дать выполнить
    await expect(
      multisig.connect(owner1).confirmTransaction(txId)
    ).to.emit(multisig, "ConfirmTransaction");

    // пытаемся выполнить с недостаточным числом подтверждений
    await expect(
      multisig.connect(owner1).executeTransaction(txId)
    ).to.be.revertedWith("cannot execute tx");

    // добираем нужное количество подтверждений
    await expect(
      multisig.connect(owner2).confirmTransaction(txId)
    ).to.emit(multisig, "ConfirmTransaction");

    // теперь уже должно исполниться
    await expect(
      multisig.connect(owner1).executeTransaction(txId)
    ).to.emit(multisig, "ExecuteTransaction");

    const tx = await multisig.getTransaction(txId);
    expect(tx.executed).to.equal(true);
    expect(tx.numConfirmations).to.equal(BigInt(numConfirmationsRequired));
  });

  it("does not allow double confirmation or double execution", async () => {
    const { multisig, owner1, owner2, owner3 } = await deployMultisig();

    const to = owner3.address;
    const value = 0;
    const data = "0x";

    await multisig.connect(owner1).submitTransaction(to, value, data);
    const txCount = await multisig.getTransactionCount();
    const txId = txCount - 1n;

    await multisig.connect(owner1).confirmTransaction(txId);

    // повторное подтверждение тем же владельцем запрещено
    await expect(
      multisig.connect(owner1).confirmTransaction(txId)
    ).to.be.revertedWith("tx already confirmed");

    await multisig.connect(owner2).confirmTransaction(txId);
    await multisig.connect(owner1).executeTransaction(txId);

    // повторное исполнение тоже запрещено
    await expect(
      multisig.connect(owner1).executeTransaction(txId)
    ).to.be.revertedWith("tx already executed");
  });
});

