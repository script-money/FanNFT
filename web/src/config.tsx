import * as fcl from '@onflow/fcl'

fcl
  .config()
  // .put('accessNode.api', 'http://localhost:8080') // local Flow emulator
  // .put('challenge.handshake', 'http://localhost:8701/flow/authenticate') // local dev wallet
  // .put('challenge.scope', 'email') // request for Email
  .put('accessNode.api', 'https://access-testnet.onflow.org') // Flow testnet
  .put('challenge.handshake', 'https://flow-wallet-testnet.blocto.app/authn') // Blocto testnet wallet

const flowServiceConfig = {
  minterFlowAddress: '0x20c418e24c7f99a5', // testnet
  // minterFlowAddress: '0xf8d6e0586b0a20c7', // emulator
  minterPrivateKeyHex: '8c2031f486af68f24d41d274d1e2af2fc69a600b9a4bd392734e2e95241d1b5f', // testnet
  // minterPrivateKeyHex: '84f82df6790f07b281adb5bbc848bd6298a2de67f94bdfac7a400d5a1b893de5', // emulator
  minterAccountIndex: 0,
}

export const adminAddress = flowServiceConfig.minterFlowAddress

const nonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"'
const fanNFTPath = '"../../contracts/FanNFT.cdc"'

export const nonFungibleTokenAddress = '0x631e88ae7f1d7c20' // testnet
// const nonFungibleTokenAddress = adminAddress // emulator
const fanNFTPathAddress = adminAddress

export const ReplaceAddress = (source: string) => {
  return source
    .replace(nonFungibleTokenPath, fcl.withPrefix(nonFungibleTokenAddress))
    .replace(fanNFTPath, fcl.withPrefix(fanNFTPathAddress))
}
