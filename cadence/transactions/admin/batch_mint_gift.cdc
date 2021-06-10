import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

// 该transaction用于礼包倒计时结束，管理员会根据Package的rewardAdresses来mint礼物，
// 然后deposit到参加reward的账户路径里。空的collection存回admin的storage中

transaction(packageID: UInt32) {

    let adminRef: &FanNFT.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)!
    }

    execute {
      
        let packageRef = self.adminRef.borrowPackage(packageID: packageID)
        let collection <- packageRef.batchMintGift(packageID: packageID)
        let ids = collection.getIDs()
        let addresses = packageRef.rewardAdresses
        var newIds:[UInt64] = []
        for newAddress in addresses{
          newIds.append(ids.removeLast())
        }
        for id in newIds{             
          let recieverAddress = addresses[id-(1 as UInt64)]      
          let recipient = getAccount(recieverAddress)
          let receiver = recipient
            .getCapability(FanNFT.GiftPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")
          receiver.deposit(token: <-collection.withdraw(withdrawID:id))
        }
        
        self.adminRef.saveEmptyCollection(emptyCollection: <-collection)
    }
}