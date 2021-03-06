import { ReplaceAddress } from '../config'
import { useState } from 'react'
import { useLocalStorageState } from 'ahooks'
import * as fcl from '@onflow/fcl'
import styled from 'styled-components'

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

const PopBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5000;
  display: flex;
  justify-content: center;
  align-items: center;
`

const InfoCard = styled.div`
  width: 500px;
  height: 200px;
  border-radius: 12px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`

const InfoTitle = styled.div`
  font-size: 2rem;
  flex: 1;
`

const InfoText = styled.div`
  color: grey;
  margin-top: 20px;
  font-size: 1.5rem;
  flex: 4;
`

const OperateButton = styled.button`
  width: 100px;
  height: 60px;
  flex: 1;
  margin: 10px;
  color: gray;
  background: transparent;
  border: 2px solid gray;
  border-radius: 12px;
  font-size: 16px;
  &:hover {
    background-color: RGB(245, 192, 237);
    color: white;
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
      alert('Transaction failed: ' + error)
      setTransactionText('Transaction failed: ' + error)
    }
  }

  return (
    <>
      {(userInitStatus === false || userInitStatus === undefined) && (
        <PopBackground>
          <InfoCard>
            <InfoTitle>??????</InfoTitle>
            <InfoText>?????????????????????????????????????????????</InfoText>
            <OperateButton onClick={sendSetupAccountTransaction}>Approve</OperateButton>
          </InfoCard>
        </PopBackground>
      )}
    </>
  )
}

export default SetupAccount
