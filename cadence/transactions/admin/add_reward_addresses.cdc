import FanNFT from "../../contracts/FanNFT.cdc"

// 该transition可以向package传入符合条件的fans的地址列表。

transaction(addresses: [Address], packageID: UInt32) {
  let adminRef: &FanNFT.Admin

  prepare(acct: AuthAccount) {
      self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)
        ?? panic("No admin resource in storage")
  }

  execute{
    let packageRef = self.adminRef.borrowPackage(packageID: packageID)
    packageRef.addRewardAddresses(addressArray: addresses)
  }
}