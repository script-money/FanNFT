import { ReplaceAddress } from '../config'
import { useState } from 'react'
import { useLocalStorageState } from 'ahooks'
import * as fcl from '@onflow/fcl'

const setUpAccountTransactionSource = `\
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"

pub fun hasGifts(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&FanNFT.Collection{NonFungibleToken.CollectionPublic, FanNFT.GiftCollectionPublic}>(FanNFT.GiftPublicPath)
    .check()
}

transaction {
  prepare(signer: AuthAccount) {
    if !hasGifts(signer.address){
      log("account init start")
      if signer.borrow<&FanNFT.Collection>(from: FanNFT.GiftStoragePath) == nil {
        signer.save(<-FanNFT.createEmptyCollection(), to: FanNFT.GiftStoragePath)
      }
      signer.unlink(FanNFT.GiftPublicPath)
      signer.link<&{NonFungibleToken.CollectionPublic,FanNFT.GiftCollectionPublic}>
        (FanNFT.GiftPublicPath,target: FanNFT.GiftStoragePath)
    }else{
      log("account init already")
    }
  }
}
`

const setUpAccountTransaction = ReplaceAddress(setUpAccountTransactionSource)

const SetupAccount = () => {
  const [userInitStatus, setUserInitStatus] = useLocalStorageState('userInitStatus', false)
  const [transactionText, setTransactionText] = useState('')
  const [transaction, setTransaction] = useState(null)

  const sendSetupAccountTransaction = async () => {
    const blockResponse = await fcl.send([fcl.getLatestBlock()])
    const block = await fcl.decode(blockResponse)

    try {
      const { transactionId } = await fcl.send([
        fcl.transaction(setUpAccountTransaction),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.authorizations([fcl.currentUser().authorization]),
        fcl.payer(fcl.currentUser().authorization),
        fcl.ref(block.id),
        fcl.limit(999),
      ])

      setTransactionText('Transaction sent, waiting for confirmation' + ' trxId: ' + transactionId)

      const unsub = fcl.tx({ transactionId }).subscribe((transaction: React.SetStateAction<null>) => {
        setTransaction(transaction)

        if (fcl.tx.isSealed(transaction)) {
          setTransactionText('Transaction is Sealed')
          unsub()
          setUserInitStatus(true)
        }
      })
    } catch (error) {
      setTransactionText('Transaction failed: ' + error)
    }
  }

  return (
    <>
      ({userInitStatus === false && <button onClick={sendSetupAccountTransaction}>设置账户</button>})
      {/* TODO 显示transactionText和transaction */}
    </>
  )
}

export default SetupAccount
