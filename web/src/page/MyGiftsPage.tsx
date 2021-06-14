import { useContext, useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { ReplaceAddress } from '../config'

import Card from '../demo/Card'
import Header from '../demo/Header'
import Code from '../demo/Code'

// import { userStatusContext } from '../context'

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

const GetGiftsPage = () => {
  const [data, setData] = useState(null)
  const [user, setUser] = useState(null)
  // const userStatus = useContext(userStatusContext)

  useEffect(() => fcl.currentUser().subscribe((user: any) => setUser({ ...user })), [])

  const getGiftsButton = async (event: any) => {
    event.preventDefault()

    // try {
    //   const res = await fcl.send([fcl.script(getGiftsScript), fcl.args([fcl.arg(userStatus.address, t.Address)])])
    //   setData(await fcl.decode(res))
    // } catch (error) {
    //   setData(error)
    // }
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

export default GetGiftsPage
