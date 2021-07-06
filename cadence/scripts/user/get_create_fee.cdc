import FanNFT from "../../contracts/FanNFT.cdc"

// 返回createFee
pub fun main(): UFix64 {    
    return FanNFT.createFee
}