import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&FanNFT.Collection>(from: FanNFT.GiftStoragePath) == nil {

            // create a new empty collection
            let collection <- FanNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: FanNFT.GiftStoragePath)

            // create a public capability for the collection
            signer.link<&FanNFT.Collection{FanNFT.GiftCollectionPublic}>(FanNFT.GiftPublicPath,target: FanNFT.GiftStoragePath)
        }
    }
}