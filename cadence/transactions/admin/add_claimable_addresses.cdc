import FanNFT from "../../contracts/FanNFT.cdc"

transaction(addresses: [Address], packageID: UInt32) {
  let adminRef: &FanNFT.Admin

  prepare(acct: AuthAccount) {
      self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)
        ?? panic("No admin resource in storage")
  }

  execute{
    let packageRef = self.adminRef.borrowPackage(packageID: packageID)
    packageRef.addClaimableAddresses(addressArray: addresses)
  }
}