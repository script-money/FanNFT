import { useContext, useState, useEffect, FC, createContext, Component } from 'react'
import * as fcl from '@onflow/fcl'
import { ReplaceAddress } from '../config'
import { SignInOutButton, userContext } from '../demo/Authenticate'
import useLocalJSONStore from '../utils/useLocalJSONStore'

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

// 在页面mount时运行，如果非登录状态就弹出钱包登录，如果已登录就读取currentuser到context里面
const Authenticate = () => {
  const [user, setUser] = useState({ loggedIn: false, addr: '' })
  const [transactionText, setTransactionText] = useState('未初始化')
  const [userInitStatus, setUserInitStatus] = useLocalJSONStore('userInitStatus', false)
  const [transaction, setTransaction] = useState(null)

  const sendSetupAccountTransaction = async () => {
    setTransactionText('Resolving...')

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

  useEffect(() => {
    function launch() {
      fcl.currentUser().subscribe((user: any) => {
        if (user.loggedIn === null) {
          fcl.authenticate()
        } else {
          setUser({ ...user })
        }
      })
      if (userInitStatus) {
        console.log('Account storage is setup, return')
      } else {
        sendSetupAccountTransaction()
      }
    }
    launch()
  }, [])
  return (
    <>
      <SignInOutButton user={user}></SignInOutButton>
      <p>userStatus: {userInitStatus ? '账户已经初始化' : '账户未初始化'}</p>
      <p>transactionText: {transactionText}</p>
      <p>{transaction && JSON.stringify(transaction, null, 2)}</p>
    </>
  )
}

export default Authenticate
