import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"

pub fun hasGifts(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&FanNFT.Collection{NonFungibleToken.CollectionPublic, FanNFT.GiftCollectionPublic}>(FanNFT.GiftPublicPath)
    .check()
}

transaction {
  prepare(signer: AuthAccount) {
    if !hasGifts(signer.address){
      if signer.borrow<&FanNFT.Collection>(from: FanNFT.GiftStoragePath) == nil {
        signer.save(<-FanNFT.createEmptyCollection(), to: FanNFT.GiftStoragePath)
      }
      signer.unlink(FanNFT.GiftPublicPath)
      signer.link<&{NonFungibleToken.CollectionPublic,FanNFT.GiftCollectionPublic}>
        (FanNFT.GiftPublicPath,target: FanNFT.GiftStoragePath)
    }
  }
}