import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { assert } from "console";
import { parseEther } from "ethers/lib/utils";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    it(`should revert if the token amount is not greater than 0`, async function () {
      const amount = ethers.constants.Zero;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith("NeedsMoreThanZero");
    });

    it("Should emit proper event", async function () {
      const amount: BigNumber = ethers.constants.One;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      )
        .to.emit(this.lending, "Deposit")
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });

    it("Should update storage variable properly", async function () {
      const previousAccountToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      const amount: BigNumber = ethers.constants.One;

      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);

      const currentAccountToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      assert(
        currentAccountToTokenDeposits.toBigInt() ===
          previousAccountToTokenDeposits.add(amount).toBigInt(),
        "New value should equal previous value plus amount"
      );
    });

    it("Should revert with TransferFailed Error", async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);

      const amount: BigNumber = parseEther("1");

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith('TransferFailed');
    });
  });
};
