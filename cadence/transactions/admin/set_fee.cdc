import FanNFT from "../../contracts/FanNFT.cdc"

// 该transition可以设置创建package需要的flowToken数量

transaction(amount:UFix64) {
  let adminRef: &FanNFT.Admin

  prepare(acct: AuthAccount) {
      self.adminRef = acct.borrow<&FanNFT.Admin>(from: FanNFT.AdminStoragePath)
        ?? panic("No admin resource in storage")
  }

  execute{
    self.adminRef.setFee(amount: amount)
  }
}