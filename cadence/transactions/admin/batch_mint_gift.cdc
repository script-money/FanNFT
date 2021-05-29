import FanNFT from 0xf8d6e0586b0a20c7

transaction(packageID: UInt32, quantity: UInt64) {

    // Local variable for the fanNFT Admin object
    let adminRef: &FanNFT.Admin

    prepare(acct: AuthAccount) {

        // borrow a reference to the Admin resource in storage
        self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)!
    }

    execute {

        // borrow a reference to the package to be minted from
        let packageRef = self.adminRef.borrowPackage(packageID: packageID)

        // Mint all the new NFTs
        let collection <- packageRef.batchMintMoment(packageID: packageID, quantity: quantity)

        // Get the account object for the recipient of the minted tokens
        let recipient = getAccount(&FanNFT)

        // get the Collection reference for the receiver
        let receiverRef = recipient.getCapability(/public/MomentCollection)!.borrow<&{TopShot.MomentCollectionPublic}>()
            ?? panic("Cannot borrow a reference to the recipient's collection")

        // deposit the NFT in the receivers collection
        receiverRef.batchDeposit(tokens: <-collection)
    }
}