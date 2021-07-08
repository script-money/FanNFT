import * as fcl from '@onflow/fcl'

const ISTESTNET = true
export let adminAddress = '0xf8d6e0586b0a20c7'
export let nonFungibleTokenAddress = '0xf8d6e0586b0a20c7'
export let flowTokenAddress = '0x0ae53cb6e3f42a79'
export let fungibleTokenAddress = '0xee82856bf20e2aa6'
const nonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"'
const fanNFTPath = '"../../contracts/FanNFT.cdc"'
const flowTokenPath = '"../../contracts/FlowToken.cdc"'
const fungibleTokenPath = '"../../contracts/FungibleToken.cdc"'

if (ISTESTNET) {
  adminAddress = '0x3d23f5f79a6df524'
  nonFungibleTokenAddress = '0x631e88ae7f1d7c20'
  flowTokenAddress = '0x7e60df042a9c0868'
  fungibleTokenAddress = '0x9a0766d93b6608b7'
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
    .replace(flowTokenPath, fcl.withPrefix(flowTokenAddress))
    .replace(fungibleTokenPath, fcl.withPrefix(fungibleTokenAddress))
}
