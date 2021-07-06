import * as fcl from '@onflow/fcl'

const ISTESTNET = false
export let adminAddress = '0xf8d6e0586b0a20c7'
export let nonFungibleTokenAddress = '0xf8d6e0586b0a20c7'
const nonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"'
const fanNFTPath = '"../../contracts/FanNFT.cdc"'

if (ISTESTNET) {
  adminAddress = '0x3d23f5f79a6df524'
  nonFungibleTokenAddress = '0x631e88ae7f1d7c20'
  fcl
    .config()
    .put('accessNode.api', 'https://access-testnet.onflow.org') // Flow testnet
    .put('challenge.handshake', 'https://fcl-discovery.onflow.org/testnet/authn')
} else {
  // 模拟器
  fcl
    .config()
    .put('accessNode.api', 'http://localhost:8080') // local Flow emulator
    .put('discovery.wallet', 'http://localhost:3000/fcl/authn')
}

export const ReplaceAddress = (source: string) => {
  return source
    .replace(nonFungibleTokenPath, fcl.withPrefix(nonFungibleTokenAddress))
    .replace(fanNFTPath, fcl.withPrefix(adminAddress))
}
