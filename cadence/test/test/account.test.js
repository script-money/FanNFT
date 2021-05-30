import path from "path";
import {
  init,
  getAccountAddress,
  deployContractByName,
  getFlowBalance,
  mintFlow,
  getContractAddress,
  getTransactionCode,
  sendTransaction,
  getScriptCode,
  executeScript
} from "flow-js-testing";
import { UInt32, String, Dictionary, Address } from "@onflow/types";

const basePath = path.resolve(__dirname, "../../../cadence");
const port = 8080;
init(basePath, port);

describe("Contract deploy", () => {
  it("get account FLOW balance", async () => {
    const newAccountAddress = await getAccountAddress("Admin");
    const balance = await getFlowBalance(newAccountAddress);
    console.log({ balance });
    await mintFlow(newAccountAddress, "10.572");
    const newBalance = await getFlowBalance(newAccountAddress);
    console.log({ newBalance });
  });

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


describe("User create new package", () => {
  it("用户可以让admin创建package,存储到admin的路径下,并通过接口读到", async () => {
    const userAddress = await getAccountAddress("User");
    const adminAddress = await getAccountAddress("Admin");
    const transCode = await getTransactionCode({ name: 'user/create_package', addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress } })
    const args = [
      ["test package 1", String],
      [
        [
          { key: "description", value: "这是第一个测试包" },
          { key: "message", value: "Hello fannft" },
        ],
        Dictionary({ key: String, value: String })
      ],
      [10, UInt32],
      [adminAddress, Address]
    ];
    const signers = [userAddress]
    const tx = await sendTransaction({ code: transCode, args: args, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getPackagesScript = await getScriptCode({ name: 'user/get_all_packages', addressMap: { FanNFT: adminAddress } })
    const result = await executeScript({ code: getPackagesScript })
    expect(tx.errorMessage).toBe("");
    console.log(result[0])
    expect(result[0].packageID).toBe(0);
    expect(result[0].totalNumber).toBe(10)
    expect(result[0].actualTotalNumber).toBe(0)
    expect(result[0].locked).toBe(false)
  })
})