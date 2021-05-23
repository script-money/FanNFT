import FanNFT from 0xFANNFTADDRESS

// 该transaction用于Giver创建Package时，初始化Package Resource
// 然后存储在FanNFT的合约中

// Parameters
//
// name: Package的名称
// metadata: Package的详细信息，json格式
// totalNumber: 准备发放的Gift的最大数量

transaction(name: String, metadata:{String:String}, totalNumber: UInt32){
  prepare(acct: AuthAccount){
    let admin = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)
      ?? panic("Could not borrow a reference to the Admin resource")
    admin.createPackage(name: name, metadata:metadata, totalNumber:totalNumber)
  }
}