import FanNFT from "../../contracts/FanNFT.cdc"

pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}