import FanNFT from "../../contracts/FanNFT.cdc"

transaction(packageID: UInt32) {

    // Local variable for the fanNFT Admin object
    let adminRef: &FanNFT.Admin

    prepare(acct: AuthAccount) {

        // borrow a reference to the Admin resource in storage
        self.adminRef = acct.borrow<&FanNFT.Admin>(from: /storage/FanNFTAdmin)
            ?? panic("No admin resource in storage")
    }

    execute {
        // borrow a reference to the package to be minted from
        let packageRef = self.adminRef.borrowPackage(packageID: packageID)

        // Mint all the new NFTs
        packageRef.batchMintGift(packageID: packageID)
    }
}