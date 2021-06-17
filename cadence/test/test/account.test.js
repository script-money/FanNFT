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
import { UInt32, String, Address, Array, UInt64 } from "@onflow/types";

const basePath = path.resolve(__dirname, "../../../cadence");
const port = 8080;
init(basePath, port);

describe("FanNFT", () => {
  let packageID
  const ACTUALNUMBER = 20

  it("0. fund account FLOW balance", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const fanAddress1 = await getAccountAddress("Fan1");
    const fanAddress2 = await getAccountAddress("Fan2");
    await mintFlow(adminAddress, "10.572");
    await mintFlow(fanAddress, "0.01");
    await mintFlow(fanAddress1, "0.01");
    await mintFlow(fanAddress2, "0.01");
    const newBalance = await getFlowBalance(adminAddress);
    expect(newBalance).not.toBe(0)
  });

  it('1. Admin can deploy two contract', async () => {
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

  it("2. Giver can create new package, storage to admin and can read", async () => {
    const userAddress = await getAccountAddress("User");
    const adminAddress = await getAccountAddress("Admin");
    const transCode = await getTransactionCode(
      {
        name: 'giver/create_package',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )

    const metadata = {
      "title": "discord gift",
      "image": "https://southportlandlibrary.com/wp-content/uploads/2020/11/discord-logo-1024x1024.jpg",
      "content": "asddd 0x01cf0e2f2f715450",
      "keyWord": "#FanNFT #test",
      "createAt": 1623325141,
      "deadline": 1623324927
    }

    const args = [
      [JSON.stringify(metadata), String],
      [10, UInt32],
      [adminAddress, Address]
    ];

    const signers = [userAddress]
    const tx = await sendTransaction({ code: transCode, args: args, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getPackagesScript = await getScriptCode(
      {
        name: 'user/get_all_packages',
        addressMap: { FanNFT: adminAddress }
      }
    )
    const result = await executeScript({ code: getPackagesScript })
    console.log('新生成的package:', result);
    expect(tx.errorMessage).toBe("");
    packageID = result[0].packageID
    expect(packageID).toBe(0);
    expect(result[0].totalNumber).toBe(10)
    expect(result[0].locked).toBe(false)
  })

  it("3. Fans can't borrow collection if not setup account", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const getAccountStorageScript = await getScriptCode(
      {
        name: 'user/get_account_storage',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [fanAddress, Address]
    ]
    const result = await executeScript({ code: getAccountStorageScript, args: args1 })
    expect(result).toBe(null)
  })

  it("4. Fans can init FanNFT vault", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const fanAddress1 = await getAccountAddress("Fan1");
    const fanAddress2 = await getAccountAddress("Fan2");
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
        name: 'user/get_account_storage',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [fanAddress, Address]
    ]
    const result = await executeScript({ code: getAccountStorageScript, args: args2 })
    expect(result).not.toBe(null)

    const signers1 = [fanAddress1]
    await sendTransaction({ code: transCode, args: args1, signers: signers1 })
    const signers2 = [fanAddress2]
    await sendTransaction({ code: transCode, args: args1, signers: signers2 })
  })

  it("5. Admin can add Address array have right to reward", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress = await getAccountAddress("Fan");
    const fanAddress1 = await getAccountAddress("Fan1");
    const fanAddress2 = await getAccountAddress("Fan2");
    const transCode = await getTransactionCode(
      {
        name: 'admin/add_reward_addresses',
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
        name: 'user/get_package_data_by_id',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [packageID, UInt32]
    ]
    const result = await executeScript({ code: getPackageDataByIdScript, args: args2 })
    expect(result.rewardAddresses.length).toBe(3)
  })

  it("6. Admin can mint NFT according reward addresses and send to fans", async () => {
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

    // select on fans check
    const fanAddress2 = await getAccountAddress("Fan2");
    const getPackageDataByIdScript = await getScriptCode(
      {
        name: 'user/get_all_gift_ids_by_address',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [fanAddress2, Address]
    ]
    const result = await executeScript({ code: getPackageDataByIdScript, args: args2 })
    expect(result).toMatchObject([3]);
  })

  it("7. Fans can get all gift data his/her recieved", async () => {
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress2 = await getAccountAddress("Fan2");
    const getPackageDataByIdScript = await getScriptCode(
      {
        name: 'user/get_all_packages',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      []
    ]
    const packageDatas = await executeScript({ code: getPackageDataByIdScript, args: args1 })

    const getAllGiftIdsScript = await getScriptCode(
      {
        name: 'user/get_all_gift_ids_by_address',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [fanAddress2, Address]
    ]
    const ownIDs = await executeScript({ code: getAllGiftIdsScript, args: args2 })

    const getGiftDataByIdScript = await getScriptCode(
      {
        name: 'user/get_gift_data_by_id',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )

    const args3 = [
      [fanAddress2, Address],
      [ownIDs, Array(UInt64)]
    ]
    const result = await executeScript({ code: getGiftDataByIdScript, args: args3 })
    expect(result[0]).toMatchObject({ id: 3, packageID: 0, serialNumber: 3 })
  })

  it("8. Giver create other new package, new address can recieve new gift", async () => {
    const userAddress = await getAccountAddress("User");
    const adminAddress = await getAccountAddress("Admin");
    const fanAddress3 = await getAccountAddress("Fan3");
    const fanAddress4 = await getAccountAddress("Fan4");

    const setupTransCode1 = await getTransactionCode(
      {
        name: 'fans/setup_account',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    await sendTransaction({ code: setupTransCode1, args: [[]], signers: [fanAddress3] })

    const setupTransCode2 = await getTransactionCode(
      {
        name: 'fans/setup_account',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    await sendTransaction({ code: setupTransCode2, args: [[]], signers: [fanAddress4] })

    const transCode = await getTransactionCode(
      {
        name: 'giver/create_package',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )

    const metadata = {
      "title": "discord gift",
      "image": "https://southportlandlibrary.com/wp-content/uploads/2020/11/discord-logo-1024x1024.jpg",
      "content": "asddd 0x01cf0e2f2f715450",
      "keyWord": "#FanNFT #test",
      "createAt": 1623325141,
      "deadline": 1623324927
    }

    const args = [
      [JSON.stringify(metadata), String],
      [4, UInt32],
      [adminAddress, Address]
    ];

    const signers = [userAddress]
    const tx = await sendTransaction({ code: transCode, args: args, signers: signers })
    expect(tx.errorMessage).toBe("");
    expect(tx.status).toBe(4);

    const getPackagesScript = await getScriptCode(
      {
        name: 'user/get_all_packages',
        addressMap: { FanNFT: adminAddress }
      }
    )
    const result = await executeScript({ code: getPackagesScript })
    console.log('新生成的package:', result);
    expect(tx.errorMessage).toBe("");
    let packageID = result[1].packageID
    expect(packageID).toBe(1);
    expect(result[1].totalNumber).toBe(4)
    expect(result[1].locked).toBe(false)

    const transCode2 = await getTransactionCode(
      {
        name: 'admin/add_reward_addresses',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args1 = [
      [[fanAddress3, fanAddress4], Array(Address)],
      [packageID, UInt32]
    ];
    const tx1 = await sendTransaction({ code: transCode2, args: args1, signers: [adminAddress] })
    expect(tx1.errorMessage).toBe("");
    expect(tx1.status).toBe(4);

    const transCode3 = await getTransactionCode(
      {
        name: 'admin/batch_mint_gift',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const args2 = [
      [packageID, UInt32], // packageID to mint
    ];
    const tx2 = await sendTransaction({ code: transCode3, args: args2, signers: [adminAddress] })
    expect(tx2.errorMessage).toBe("");
    expect(tx2.status).toBe(4);

    const getPackagesScript2 = await getScriptCode(
      {
        name: 'user/get_all_packages',
        addressMap: { FanNFT: adminAddress }
      }
    )
    const result2 = await executeScript({ code: getPackagesScript2 })
    console.log('第二次mint后的packages:', result2);
    expect(tx.errorMessage).toBe("");
    expect(result2[1].locked).toBe(true)

    const getAllGiftIdsScript = await getScriptCode(
      {
        name: 'user/get_all_gift_ids_by_address',
        addressMap: { NonFungibleToken: adminAddress, FanNFT: adminAddress }
      }
    )
    const ownIDs = await executeScript({ code: getAllGiftIdsScript, args: [[fanAddress3, Address]] })
    expect(ownIDs).toMatchObject([4])
  })
});