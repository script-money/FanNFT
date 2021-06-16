import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import { useExternal } from 'ahooks'
import { Share } from 'react-twitter-widgets'
import { PackageInfoProps } from '../interfaces'

const PackageInfoWrapper = styled.div`
  border: 1px solid black;
  height: 300px;
  width: 600px;
  margin: 10px 40px;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  border: 1px solid black;
  display: flex;
  justify-content: space-around;
  height: 50px;
`

const Title = styled.div`
  border: 1px solid black;
  flex: 5;
  font-size: 2rem;
`

const PackageID = styled.div`
  border: 1px solid black;
  font-size: 1rem;
  flex: 1;
  color: grey;
`

const TotalAmount = styled.div`
  border: 1px solid black;
  flex: 1;
`

const TimeWrapper = styled.div`
  border: 1px solid black;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const LockStatus = styled.div`
  border: 1px solid black;
  flex: 2;
  &.locked {
    color: red;
  }
  &.notLocked {
    color: green;
  }
`

const DeadLine = styled.div`
  border: 1px solid black;
  flex: 1;
`

const Body = styled.div`
  border: 1px solid black;
  height: 200px;
  display: flex;
`

const Content = styled.div`
  border: 1px solid black;
  width: 500px;
  font-size: 15px;
  .tag {
    color: rgb(27, 149, 224);
  }
`

const Image = styled.div`
  width: 200px;
  min-width: 200px;
  height: 200px;
  min-height: 200px;
  & > img {
    width: 100%;
    height: 100%;
  }
`

const Tail = styled.div`
  border: 1px solid black;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const PackageInfo = (props: PackageInfoProps) => {
  const packageData = props.data
  const [imgUrl, setImgUrl] = useState('')
  const ref = useRef(null)
  const [content, setContent] = useState('')

  const [status, { toggle, unload, load }] = useExternal(imgUrl, {
    type: 'img',
    target: ref,
  })

  useEffect(() => {
    setImgUrl(packageData.url)
    load()
  }, [packageData.url])

  useEffect(() => {
    setContent(packageData.retweet + ' ' + packageData.keyword)
  }, [packageData.retweet, packageData.keyword])

  return (
    <PackageInfoWrapper>
      <Header>
        <Title>{packageData.title}</Title>
        <TotalAmount>总量: {packageData.totalNumber}</TotalAmount>
        <TimeWrapper>
          <LockStatus className={packageData.isLocked ? 'locked' : 'notLocked'}>
            {packageData.isLocked ? '已结束' : '进行中'}
          </LockStatus>
          <DeadLine>
            <Countdown date={packageData.deadline}></Countdown>
          </DeadLine>
        </TimeWrapper>
      </Header>
      <Body>
        <Content>{content}</Content>
        <Image ref={ref}></Image>
      </Body>
      <Tail>
        <Share url="https://fannft.eth.link" options={{ text: content, size: 'large' }} />
      </Tail>
    </PackageInfoWrapper>
  )
}

export default PackageInfo
