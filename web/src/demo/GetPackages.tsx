import React, { useState } from 'react'
import * as fcl from '@onflow/fcl'
import { ReplaceAddress } from '../config'

import Card from '../components/Card'
import Header from '../components/Header'
import Code from '../components/Code'

const getPackagesScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"

// 获取所有package的数据
pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}
`

const getPackagesScript = ReplaceAddress(getPackagesScriptSource)

const GetPackages = () => {
  const [data, setData] = useState(null)

  const getPackageButton = async (event: any) => {
    event.preventDefault()
    try {
      const res = await fcl.send([fcl.script(getPackagesScript)])
      setData(await fcl.decode(res))
    } catch (error) {
      setData(error)
    }
  }

  return (
    <Card>
      <Header>Get Package</Header>

      <Code>{getPackagesScript}</Code>

      <button onClick={getPackageButton}>GetPackage</button>

      {data && <Code>{JSON.stringify(data, null, 2)}</Code>}
    </Card>
  )
}

export default GetPackages
