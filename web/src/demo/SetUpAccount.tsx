import React, { useState, useContext } from 'react'
import * as fcl from '@onflow/fcl'
import { ReplaceAddress } from '../config'

import Card from '../components/Card'
import Header from '../components/Header'
import Code from '../components/Code'

import { userContext } from './Authenticate'

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
      if signer.borrow<&FanNFT.Collection>(from: FanNFT.GiftStoragePath) == nil {
        signer.save(<-FanNFT.createEmptyCollection(), to: FanNFT.GiftStoragePath)
      }
      signer.unlink(FanNFT.GiftPublicPath)
      signer.link<&{NonFungibleToken.CollectionPublic,FanNFT.GiftCollectionPublic}>
        (FanNFT.GiftPublicPath,target: FanNFT.GiftStoragePath)
    }
  }
}
`

const setUpAccountTransaction = ReplaceAddress(setUpAccountTransactionSource)

const SetUpAccount = () => {
  const context = useContext(userContext)
  const [status, setStatus] = useState('Not started')
  const [transaction, setTransaction] = useState(null)

  const sendTransaction = async (event: any) => {
    event.preventDefault()

    setStatus('Resolving...')

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

      setStatus('Transaction sent, waiting for confirmation' + ' trxId: ' + transactionId)

      const unsub = fcl.tx({ transactionId }).subscribe((transaction: React.SetStateAction<null>) => {
        setTransaction(transaction)

        if (fcl.tx.isSealed(transaction)) {
          setStatus('Transaction is Sealed')
          unsub()
        }
      })
    } catch (error) {
      setStatus('Transaction failed: ' + error)
    }
  }

  return (
    <Card>
      <Header>set Up Account(Transaction)</Header>

      <Code>Signer is: {context.address}</Code>

      <Code>{setUpAccountTransaction}</Code>

      <button onClick={sendTransaction}>Send</button>

      <Code>Status: {status}</Code>

      {transaction && <Code>{JSON.stringify(transaction, null, 2)}</Code>}
    </Card>
  )
}

export default SetUpAccount
