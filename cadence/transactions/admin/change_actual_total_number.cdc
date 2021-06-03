import FanNFT from "../../contracts/FanNFT.cdc"

transaction(packageID: UInt32, actualTotalNumber: UInt64) {
  let adminRef: &FanNFT.Admin

  prepare(acct: AuthAccount) {
      self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)
        ?? panic("No admin resource in storage")
  }

  execute{
    let packageRef = self.adminRef.borrowPackage(packageID: packageID)
    packageRef.setActualTotalNumber(number: actualTotalNumber)
  }
}