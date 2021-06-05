import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

// 返回用户持有的giftNFT信息

pub fun main(address: Address, giftIDs: [UInt64]): [FanNFT.GiftData] {
    let collectionRef = getAccount(address).getCapability(FanNFT.GiftPublicPath)
      .borrow<&{FanNFT.GiftCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")

    let giftsData:[FanNFT.GiftData] = []

    for giftID in giftIDs{
      let giftItem = collectionRef.borrowGift(id: giftID)
          ?? panic("No such giftID in that collection")
      giftsData.append(giftItem.data)
    }

    return giftsData
}
