import NonFungibleToken from 0xf8d6e0586b0a20c7
import FanNFT from 0xf8d6e0586b0a20c7

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&FanNFT.Collection>(from: FanNFT.PackageStoragePath) == nil {

            // create a new empty collection
            let collection <- FanNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: FanNFT.PackageStoragePath)

            // create a public capability for the collection
            signer.link<&FanNFT.Collection{NonFungibleToken.CollectionPublic, FanNFT.PackageCollectionPublic}>(FanNFT.PackagePublicPath, target: FanNFT.PackageStoragePath)
        }
    }
}
