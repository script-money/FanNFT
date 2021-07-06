import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";
import { getAdminAddress } from "./common";

export const deployFanNFT = async () => {
  const FanNFTAdmin = await getAdminAddress()
  await mintFlow(FanNFTAdmin, "10.0")

  await deployContractByName({ to: FanNFTAdmin, name: "NonFungibleToken" })

  const addressMap = { NonFungibleToken: FanNFTAdmin }
  return deployContractByName({ to: FanNFTAdmin, name: "FanNFT", addressMap })
}

export const setupFanNFTOnAccount = async (account) => {
  const name = "fans/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};

export const getFanNFTSupply = async () => {
  const name = "user/get_nft_supply";

  return executeScript({ name });
};

export const createPackage = async (sender, metadata, total, mint = true) => {
  if (mint) {
    await mintFlow(sender, "1.0")
  }
  const name = "giver/create_package"
  const FanNFTAdmin = await getAdminAddress()
  const args = [metadata, total, FanNFTAdmin];
  const signers = [sender]

  return sendTransaction({ name, args, signers });
}

export const getAllPackages = async () => {
  const name = "user/get_all_packages"
  return executeScript({ name })
}

export const getAllGiftIdsByAddress = async (address) => {
  const name = "user/get_all_gift_ids_by_address"
  const args = [address]
  return executeScript({ name, args })
}

export const getCreateFee = async () => {
  const name = "user/get_create_fee"
  return executeScript({ name })
}

export const addRewardAddress = async (addresses, packageID, signer = undefined) => {
  if (signer === undefined) {
    signer = await getAdminAddress()
  }
  const name = "admin/add_reward_addresses"
  const args = [addresses, packageID];
  const signers = [signer]
  return sendTransaction({ name, args, signers });
}

export const batchMintGift = async (packageID, signer = undefined) => {
  if (signer === undefined) {
    signer = await getAdminAddress()
  }

  const name = "admin/batch_mint_gift"
  const args = [packageID];
  const signers = [signer]
  return sendTransaction({ name, args, signers });
}

export const setFee = async (amount, signer = undefined) => {
  if (signer === undefined) {
    signer = await getAdminAddress()
  }

  const name = "admin/set_fee"
  const args = [amount];
  const signers = [signer]
  return sendTransaction({ name, args, signers });
}

export const getGiftDataByID = async (address, giftIDs) => {
  const name = "user/get_gift_data_by_id"
  const args = [address, giftIDs]
  return executeScript({ name, args })
}