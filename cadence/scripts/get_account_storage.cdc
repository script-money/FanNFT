import FanNFT from "../contracts/FanNFT.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"

// 用于测试地址是否初始化了账户

pub fun main(address: Address): &AnyResource? {

    let account = getAccount(address)
    let NFTCap = account.getCapability(FanNFT.GiftPublicPath)
    return NFTCap.borrow<&{FanNFT.GiftCollectionPublic}>()
}
