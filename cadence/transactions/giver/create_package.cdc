import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
// import FlowToken from 0x0ae53cb6e3f42a79 // 模拟器
// import FlowToken from 0x7e60df042a9c0868 // 测试网
import FungibleToken from "../../contracts/FungibleToken.cdc"
// import FungibleToken from 0xee82856bf20e2aa6 // 模拟器
// import FungibleToken from 0x9a0766d93b6608b7 // 测试网

transaction(metadata: String, totalNumber: UInt32, adminAccount: Address) {
  let sentVault: @FungibleToken.Vault
  
  prepare(acct: AuthAccount){
    let amount = FanNFT.createFee
    let vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
    self.sentVault <- vaultRef.withdraw(amount: amount)
  }

  execute {
    let admin = getAccount(adminAccount)
    let adminRef = admin.getCapability(FanNFT.AdminPublicPath).borrow<&{FanNFT.AdminPublic}>()!
    let receiverRef = admin
      .getCapability(/public/flowTokenReceiver)
      .borrow<&{FungibleToken.Receiver}>()
			?? panic("Could not borrow receiver reference to the recipient's Vault")
    receiverRef.deposit(from: <-self.sentVault)

    adminRef.createPackage(metadata: metadata, totalNumber: totalNumber)
  }
}
 