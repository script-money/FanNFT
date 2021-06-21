import FanNFT from "../../contracts/FanNFT.cdc"

// 返回总生成的giftNFT数量
pub fun main(): UInt64 {    
    return FanNFT.totalSupply
}