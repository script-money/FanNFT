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
import { UInt32, UInt64, String, Dictionary, Address, Array } from "@onflow/types";

const basePath = path.resolve(__dirname, "../../../cadence");
const port = 8080;
init(basePath, port);

describe("FanNFT", () => {
  let packageID
  const ACTUALNUMBER = 20

  it("fund account FLOW balance", async () => {
    const adminAddress = await getAccountAddress("Admin");
    await mintFlow(adminAddress, "10.572");
    const newBalance = await getFlowBalance(adminAddress);
    expect(newBalance).not.toBe(0)
  });

  it('Admin can deploy two contract', async () => {
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

  it("Giver can create new package, storage to admin and can read", async () => {
    const userAddress = await getAccountAddress("User");
    const adminAddress = await getAccountAddress("Admin");
    const transCode = await getTransactionCode(
      {
        name: 'giver/create_package',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args = [
      ["test package 1", String],
      [
        [
          { key: "description", value: "这是第一个测试包" },
          { key: "message", value: "Hello" },
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

    const getPackagesScript = await getScriptCode(
      {
        name: 'get_all_packages',
        addressMap: { FanNFT: adminAddress }
      }
    )
    const result = await executeScript({ code: getPackagesScript })
    expect(tx.errorMessage).toBe("");
    packageID = result[0].packageID
    expect(packageID).toBe(0);
    expect(result[0].totalNumber).toBe(10)
    expect(result[0].actualTotalNumber).toBe(0)
    expect(result[0].locked).toBe(false)
  })

  it("Admin can modify package's actualTotalNumber", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const transCode = await getTransactionCode(
      {
        name: 'admin/change_actual_total_number',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [0, UInt32], // packageID to modify
      [ACTUALNUMBER, UInt64] // actual number
    ];
    const signers = [adminAddress]
    const tx = await sendTransaction({ code: transCode, args: args1, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getPackageDataByIDScript = await getScriptCode(
      {
        name: 'get_package_data_by_id',
        addressMap: { FanNFT: adminAddress }
      }
    )
    const args2 = [
      [0, UInt32]
    ]
    const result = await executeScript({ code: getPackageDataByIDScript, args: args2 })
    expect(tx.errorMessage).toBe("");
    expect(result.packageID).toBe(0);
    expect(result.actualTotalNumber).toBe(ACTUALNUMBER)
  })

  it("Admin can mint NFT according actualTotalNumber", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const transCode = await getTransactionCode(
      {
        name: 'admin/batch_mint_gift',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [0, UInt32], // packageID to mint
    ];
    const signers = [adminAddress]
    const tx = await sendTransaction({ code: transCode, args: args1, signers: signers })

    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);
    expect(tx.events[0].type).toBe(`A.${adminAddress.substr(2)}.FanNFT.NewGiftsMint`);
    expect(tx.events[0].data).toMatchObject({ "packageID": 0, "totalNumber": 20 });
  })

  it("Fans can't borrow collection if not setup account", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const getAccountStorageScript = await getScriptCode(
      {
        name: 'get_account_storage',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [fanAddress, Address]
    ]
    const result = await executeScript({ code: getAccountStorageScript, args: args1 })
    expect(result).toBe(null)
  })

  it("Fans can init FanNFT vault", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const transCode = await getTransactionCode(
      {
        name: 'fans/setup_account',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [[]];
    const signers = [fanAddress]
    const tx = await sendTransaction({ code: transCode, args: args1, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getAccountStorageScript = await getScriptCode(
      {
        name: 'get_account_storage',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [fanAddress, Address]
    ]
    const result = await executeScript({ code: getAccountStorageScript, args: args2 })
    expect(result).not.toBe(null)
  })

  it("Admin can add Address array have right to claim", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const fanAddress1 = await getAccountAddress("Fan1");
    const fanAddress2 = await getAccountAddress("Fan2");
    const transCode = await getTransactionCode(
      {
        name: 'admin/add_claimable_addresses',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [[fanAddress, fanAddress1, fanAddress2], Array(Address)],
      [packageID, UInt32]
    ];
    const signers = [adminAddress]
    const tx = await sendTransaction({ code: transCode, args: args1, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getPackageDataByIdScript = await getScriptCode(
      {
        name: 'get_package_data_by_id',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [packageID, UInt32]
    ]
    const result = await executeScript({ code: getPackageDataByIdScript, args: args2 })
    expect(result.claimableAddresses.length).toBe(3)
  })
});