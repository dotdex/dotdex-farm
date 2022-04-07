const { assert } = require("chai");

const DotDexToken = artifacts.require("DotDexToken");

contract("DotDexToken", ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => {
    this.cake = await DotDexToken.new({ from: minter });
  });

  it("mint", async () => {
    await this.cake.mint(alice, 1000, { from: minter });
    assert.equal((await this.cake.balanceOf(alice)).toString(), "1000");
  });
});
