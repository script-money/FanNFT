import path from "path";
import { init, getAccountAddress, deployContractByName, getFlowBalance, mintFlow, getContractAddress, deployContract, getTemplate } from "flow-js-testing";

const basePath = path.resolve(__dirname, "../../../cadence");
const port = 8080;
init(basePath, port);

describe("NonFungibleToken deploy", () => {

  // 挖一些测试币
  test("get account FLOW balance", async () => {
    const newAccountAddress = await getAccountAddress("Admin");
    const balance = await getFlowBalance(newAccountAddress);
    console.log({ balance });
    await mintFlow(newAccountAddress, "10.572");
    const newBalance = await getFlowBalance(newAccountAddress);
    console.log({ newBalance });
  });

  // 部署两个合约
  it('should be deploy two contract', async () => {
    const adminAddress = await getAccountAddress("Admin");

    try {
      await deployContractByName({ to: adminAddress, name: "NonFungibleToken" });
    } catch (e) {
      console.warn('部署NonFungibleToken出错', e);
    }
    const NonFungibleTokenContract = await getContractAddress("NonFungibleToken");
    expect(NonFungibleTokenContract).toEqual(adminAddress)

    let deployTx;
    try {
      deployTx = await deployContractByName({ to: adminAddress, name: "FanNFT", addressMap: { NonFungibleToken: adminAddress } })
    } catch (e) {
      console.warn(`部署FanNFT出错`, e);
    }
    expect(deployTx.errorMessage).toBe("");
    expect(deployTx.status).toBe(4); // 4是正常
  })
});
