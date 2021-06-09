import React, { useState, useContext, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { ReplaceAddress, adminAddress } from '../config'

import Card from '../components/Card'
import Header from '../components/Header'
import Code from '../components/Code'

import { userContext } from './Authenticate'

const createPackageTransactionSource = `\
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"

transaction(metadata: String, totalNumber: UInt32, adminAccount: Address) {
  prepare(acct: AuthAccount){
    log(acct)
  }

  execute {
    let admin = getAccount(adminAccount)
    let adminRef = admin.getCapability(FanNFT.AdminPublicPath).borrow<&{FanNFT.AdminPublic}>()!
    adminRef.createPackage(metadata: metadata, totalNumber: totalNumber)
  }
}

`

const setUpAccountTransaction = ReplaceAddress(createPackageTransactionSource)

const CreatePackage = () => {
  const context = useContext(userContext)
  const [status, setStatus] = useState('Not started')
  const [transaction, setTransaction] = useState(null)

  const [title, setTitle] = useState('')
  const [totalNumber, setTotalNumber] = useState(0)
  const [content, setContent] = useState('')
  const [keyWord, setKeyWord] = useState('')
  const [deadline, setDeadline] = useState(Date.now() + 1000 * 3 * 60)
  const [metadata, setMetadata] = useState('')

  useEffect(() => {
    const metaString = JSON.stringify({
      title,
      image: 'https://southportlandlibrary.com/wp-content/uploads/2020/11/discord-logo-1024x1024.jpg',
      content: content + ' ' + context.address,
      keyWord: '#' + keyWord,
      createAt: Date.now(),
      deadline,
    })
    setMetadata(metaString)
  }, [title, content, keyWord, deadline])

  const titleHandleChange = (event: any) => {
    setTitle(event.target.value)
  }
  const totalNumberHandleChange = (event: any) => {
    setTotalNumber(event.target.value)
  }
  const contentHandleChange = (event: any) => {
    setContent(event.target.value)
  }
  const keyWordHandleChange = (event: any) => {
    setKeyWord(event.target.value)
  }
  const deadlineHandleChange = (event: any) => {
    setDeadline(event.target.value)
  }

  const sendTransaction = async (event: any) => {
    event.preventDefault()

    setStatus('Resolving...')

    const blockResponse = await fcl.send([fcl.getLatestBlock()])

    const block = await fcl.decode(blockResponse)

    try {
      const { transactionId } = await fcl.send([
        fcl.transaction(setUpAccountTransaction),
        fcl.args([
          fcl.arg(metadata, t.String),
          fcl.arg(Number(totalNumber), t.UInt32),
          fcl.arg(adminAddress, t.Address),
        ]),
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
      <Header>Create package(Transaction)</Header>

      <Code>Signer is: {context.address}</Code>

      <input value={title} onChange={titleHandleChange} placeholder="输入礼包名"></input>
      <input type="number" value={totalNumber} onChange={totalNumberHandleChange} placeholder="礼物总数"></input>
      <input value={content} onChange={contentHandleChange} placeholder="输入转发内容"></input>
      <input value={keyWord} onChange={keyWordHandleChange} placeholder="输入关键词"></input>
      <input type="number" value={deadline} onChange={deadlineHandleChange} placeholder="输入截止日期"></input>

      <Code>{setUpAccountTransaction}</Code>
      <Code>{metadata}</Code>

      <button onClick={sendTransaction}>Send</button>

      <Code>Status: {status}</Code>

      {transaction && <Code>{JSON.stringify(transaction, null, 2)}</Code>}
    </Card>
  )
}

export default CreatePackage
