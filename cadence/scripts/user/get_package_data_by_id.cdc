import FanNFT from "../../contracts/FanNFT.cdc"

// 用于根据ID获取package的数据

pub fun main(packageID: UInt32): FanNFT.PackageData? {
    let packageData = FanNFT.getPackageDataByID(packageID:packageID)
    return packageData
}