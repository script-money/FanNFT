import { useContext, useState, useEffect, useMemo } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { ReplaceAddress } from '../config'

import Card from '../demo/Card'
import Header from '../demo/Header'
import Code from '../demo/Code'
import { SessionUserContext } from '../app/Authenticate'
import { PackageInfoContext } from '../app/Header'
import { IGiftInfo, GiftDataRes, IPackageInfo, IMetaData } from '../interfaces'

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

const getGiftInfoScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

// 返回用户持有的giftNFT信息

pub fun main(address: Address, giftIDs: [UInt64]): [FanNFT.GiftData] {
    let collectionRef = getAccount(address).getCapability(FanNFT.GiftPublicPath)
      .borrow<&{FanNFT.GiftCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")

    let giftsData:[FanNFT.GiftData] = []

    for giftID in giftIDs{
      let giftItem = collectionRef.borrowGift(id: giftID)
          ?? panic("No such giftID in that collection")
      giftsData.append(giftItem.data)
    }

    return giftsData
}
`

const getGiftsScript = ReplaceAddress(getGiftsScriptSource)
const getGiftInfoScriptScript = ReplaceAddress(getGiftInfoScriptSource)

const GetGiftsPage = () => {
  const { state, dispatch } = useContext(PackageInfoContext)
  const sessionUser = useContext(SessionUserContext)
  const [giftsData, setGiftsData] = useState<IGiftInfo[]>([])

  // TODO 先获取Gifts，然后遍历列表去和PackageInfoContext比对拿到title、totalnumber和url
  // TODO 最后去调用脚本去获取NFT的series和packageID

  useMemo(() => {
    process()
  }, [])

  async function process() {
    try {
      const resGiftsID = await fcl.send([fcl.script(getGiftsScript), fcl.args([fcl.arg(sessionUser.addr, t.Address)])])
      const resDataGiftsID = (await fcl.decode(resGiftsID)) as number[]
      if (resDataGiftsID.length === 0) {
        alert('当前用户没有礼物')
        return
      }
      const resGiftsInfo = await fcl.send([
        fcl.script(getGiftInfoScriptScript),
        fcl.args([fcl.arg(sessionUser.addr, t.Address), fcl.arg(resDataGiftsID, t.Array(t.UInt64))]),
      ])
      const resDataGiftsInfo = (await fcl.decode(resGiftsInfo)) as GiftDataRes[]
      const giftsDataList = []
      for (const giftResInfo of resDataGiftsInfo) {
        const packageInfo = state.data?.filter((packageInfo) => {
          return packageInfo.packageID === giftResInfo.packageID
        })[0]
        const metadata = JSON.parse(packageInfo!.metadata) as IMetaData
        const giftInfo: IGiftInfo = {
          title: metadata.title,
          url: metadata.url,
          createAt: new Date(metadata.createAt),
          packageID: packageInfo!.packageID,
          totalNumber: packageInfo!.totalNumber,
          NFTID: giftResInfo.id,
          seriesNum: giftResInfo.serialNumber,
        }
        giftsDataList.push(giftInfo)
      }
      setGiftsData(giftsDataList)
      console.log(giftsDataList)
    } catch (error) {
      alert(error)
    }
  }

  const getGiftsButton = async (event: any) => {
    event.preventDefault()

    await process()
  }

  return (
    <Card>
      <Header>Get Gifts</Header>

      <Code>{getGiftsScript}</Code>

      <button onClick={getGiftsButton}>GetGifts</button>

      {giftsData && <Code>{JSON.stringify(giftsData, null, 2)}</Code>}
    </Card>
  )
}

export default GetGiftsPage
