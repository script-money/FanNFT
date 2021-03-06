import React, { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { ReplaceAddress } from '../config'

import Card from './Card'
import Header from './Header'
import Code from './Code'
import { SessionUser } from '../app/Authenticate'

const getGiftsScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

// 用于获取账户下的giftID

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    let collectionRef = account.getCapability(FanNFT.GiftPublicPath)
      .borrow<&{FanNFT.GiftCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")
    return collectionRef.getIDs()
}
`

const getGiftsScript = ReplaceAddress(getGiftsScriptSource)

const GetGifts = () => {
  const [data, setData] = useState(null)
  const [user, setUser] = useState<SessionUser>({ loggedIn: false, addr: '' })

  useEffect(() => fcl.currentUser().subscribe((user: any) => setUser({ ...user })), [])

  const getGiftsButton = async (event: any) => {
    event.preventDefault()

    try {
      const res = await fcl.send([fcl.script(getGiftsScript), fcl.args([fcl.arg(user.addr, t.Address)])])
      const resData = await fcl.decode(res)
      setData(resData)
    } catch (error) {
      setData(error)
    }
  }

  return (
    <Card>
      <Header>Get Gifts</Header>

      <Code>{getGiftsScript}</Code>

      <button onClick={getGiftsButton}>GetGifts</button>

      {data && <Code>{JSON.stringify(data, null, 2)}</Code>}
    </Card>
  )
}

export default GetGifts
