import FanNFT from "../contracts/FanNFT.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"

pub fun main(address: Address): &AnyResource? {

    let account = getAccount(address)
    let NFTCap = account.getCapability(FanNFT.GiftPublicPath)
    return NFTCap.borrow<&{FanNFT.GiftCollectionPublic}>()
}
