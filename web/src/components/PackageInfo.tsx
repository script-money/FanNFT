import styled from 'styled-components'
import { useContext } from 'react'
import { PackageDataContext } from '../page/CreatePackagePageV2'

const PackageInfoWrapper = styled.div`
  border: 1px solid black;
  height: 300px;
  width: 600px;
`

const PackageInfo = () => {
  const packageData = useContext(PackageDataContext)

  return <PackageInfoWrapper>{packageData.retweet}</PackageInfoWrapper>
}

export default PackageInfo
