import { useState, useEffect, useContext } from 'react'
import * as fcl from '@onflow/fcl'
import { ReplaceAddress } from '../config'
import Content from '../app/Content'
import PackageInfo from '../components/PackageInfo'
import { IMetaData, IPackageInfo, PackageInfoDisplay } from '../interfaces'
import styled from 'styled-components'
import { PackageInfoContext } from '../app/Header'
import SetupAccount from '../app/SetupAccount'

const getPackagesScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"

// 获取所有package的数据
pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}
`

const GetPackageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

const getPackagesScript = ReplaceAddress(getPackagesScriptSource)

const GetPackagesPage = () => {
  const [data, setData] = useState<IPackageInfo[]>([])
  const [displayData, setDisplayData] = useState<PackageInfoDisplay[]>([])
  const { state, dispatch } = useContext(PackageInfoContext)

  useEffect(() => {
    async function fetchAndRenderPackages() {
      const decodeRes: IPackageInfo[] = []
      try {
        const res = await fcl.send([fcl.script(getPackagesScript)])
        const decodeRes = await fcl.decode(res)
        if (decodeRes !== []) {
          const displayDataArray = decodeRes.map((packageData: IPackageInfo) => {
            const meta = JSON.parse(packageData.metadata) as IMetaData
            console.log('meta', meta)
            const display = {
              title: meta.title,
              url: meta.url,
              retweet: meta.content,
              keyword: meta.keyWord,
              isLocked: packageData.locked,
              totalNumber: packageData.totalNumber,
              deadline: new Date(meta.deadline * 1000),
            } as PackageInfoDisplay
            return display
          })

          setDisplayData(displayDataArray)
        } else {
          alert('请求的PackageData为空')
          setDisplayData([])
        }
        setData(decodeRes)
        dispatch({ type: 'UPDATE', result: decodeRes })
      } catch (error) {
        setData([])
      }
    }
    fetchAndRenderPackages()
  }, [])

  return (
    <>
      <SetupAccount />
      <Content title="获取礼包">
        <GetPackageWrapper>
          <>
            {displayData
              .sort((a: any, b: any) => (a.deadline > b.deadline ? -1 : b.deadline > a.deadline ? 1 : 0))
              .map((packageDisplay, key) => (
                <PackageInfo key={key} data={packageDisplay} />
              ))}
          </>
        </GetPackageWrapper>
      </Content>
    </>
  )
}

export default GetPackagesPage
