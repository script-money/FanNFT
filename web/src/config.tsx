import * as fcl from '@onflow/fcl'

const ISTESTNET = true
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
    .put('challenge.handshake', 'https://flow-wallet-testnet.blocto.app/authn') // Blocto testnet wallet
} else {
  // 模拟器
  fcl
    .config()
    .put('accessNode.api', 'http://localhost:8080') // local Flow emulator
    .put('challenge.handshake', 'http://localhost:8701/flow/authenticate') // local dev wallet
    .put('challenge.scope', 'email') // request for Email
}

export const ReplaceAddress = (source: string) => {
  return source
    .replace(nonFungibleTokenPath, fcl.withPrefix(nonFungibleTokenAddress))
    .replace(fanNFTPath, fcl.withPrefix(adminAddress))
}
