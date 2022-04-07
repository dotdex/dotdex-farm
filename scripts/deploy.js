function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}

function save(chainId, name, value) {
  const fs = require("fs");

  const filename = "../dotdex-addresses/" + chainId + ".json";

  const data = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, "utf8"))
    : {};

  data[name] = value;

  fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}

async function deploy(name, args = []) {
  const signers = await ethers.getSigners();
  // const nonce = await ethers.provider.getTransactionCount(signers[0]._address);
  const { chainId } = await ethers.provider.getNetwork();
  const Token = await ethers.getContractFactory(name);
  // const finalArgs = [...args, { nonce }];
  const finalArgs = [...args];
  const token = await Token.deploy.apply(Token, finalArgs);

  save(chainId, name, token.address);
  console.log(
    "deployed ",
    name,
    "args",
    args,
    "contract address: ",
    token.address
  );
  await sleep();
  return token.address;
}

async function main() {
  // We get the contract to deploy

  const signers = await ethers.getSigners();

  const { chainId } = await ethers.provider.getNetwork();

  save(chainId, "owner", signers[0]._address);

  // usage is here
  //https://github.com/wagyu-swap/wagyu-swap-interface/blob/dev/src/constants/multicall/index.ts

  const Multicall = await deploy("Multicall2");
  await sleep();
  const DotDexToken = await deploy("DotDexToken");
  await sleep();
  const WGLMR = await deploy("WGLMR");
  await sleep();
  const admins = JSON.parse(
    require("fs").readFileSync("../dotdex-addresses/admins.json", "utf8")
  );

  const defaultTokens = admins.defaultTokens[chainId.toString()];

  //deplay WETH, BUSD, USDT, USDC
  for (var i = 0; i < defaultTokens.length; i++) {
    await deploy(defaultTokens[i]);
    await sleep();
  }

  const DotDexStake = await deploy("DotDexStake", [DotDexToken]);

  const _cakePerSecond = "13000000000000000000";

  //const blockNumber = await ethers.provider.getBlockNumber();

  const _startTimestamp = parseInt(new Date().getTime() / 1000);
  const _endTimestamp = _startTimestamp + 3600 * 24 * 365;

  const _devaddr = admins._devaddr;
  //const bonusPeriodSeconds = 10000
  //const bonusEndTimestamp = _startTimestamp + bonusPeriodSeconds
  //const vlxStakingRewardPerSecond = '42000000000000000'

  //Timelock
  const Timelock = await deploy("Timelock", [_devaddr, 21700]);

  const DotDexFarm = await deploy("DotDexFarm", [
    DotDexToken,
    DotDexStake,
    _devaddr,
    _cakePerSecond,
    _startTimestamp,
    _endTimestamp,
  ]);

  const DotDexVault = await deploy("DotDexVault", [
    DotDexToken,
    DotDexStake,
    DotDexFarm,
    _devaddr,
    _devaddr,
  ]);

  await deploy("VaultOwner", [DotDexVault]);

  //await deploy("VLXStaking", [WGLMR, DotDexToken, vlxStakingRewardPerSecond, _startTimestamp, bonusEndTimestamp, _devaddr, WGLMR]);

  await deploy("DotDexStakingFactory");

  //MasterChef _chef, IBEP20 _wagyu, address _admin, address _receiver
  //const LotteryRewardPool = await deploy("LotteryRewardPool", [DotDexFarm, WagyuToken, _devaddr, _devaddr]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
