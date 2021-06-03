import FanNFT from "../contracts/FanNFT.cdc"

pub fun main(packageID: UInt32): FanNFT.PackageData? {
    let packageData = FanNFT.getPackageDataByID(packageID:packageID)
    log(packageData)
    return packageData
}