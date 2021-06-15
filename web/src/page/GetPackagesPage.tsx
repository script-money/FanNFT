import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import { ReplaceAddress } from '../config'
import Content from '../app/Content'
import PackagesContainer from '../components/PackagesContainer'

const getPackagesScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"

// 获取所有package的数据
pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}
`

const getPackagesScript = ReplaceAddress(getPackagesScriptSource)

const GetPackagesPage = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fcl.send([fcl.script(getPackagesScript)])
        setData(await fcl.decode(res))
      } catch (error) {
        setData(error)
      }
    }
    fetchPackages()
  }, [])

  return (
    <Content title="获取礼包">
      <PackagesContainer source={data} />
    </Content>
  )
}

export default GetPackagesPage
