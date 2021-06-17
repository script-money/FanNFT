import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import { useExternal } from 'ahooks'
import { Share } from 'react-twitter-widgets'
import { PackageInfoProps } from '../interfaces'

const PackageInfoWrapper = styled.div`
  border: 1px solid transparent;
  box-shadow: 0 2px 5px 1px rgb(64 60 67 / 16%);
  border-radius: 12px;
  height: 300px;
  width: 600px;
  margin: 10px 40px;
  display: flex;
  flex-direction: column;
  padding: 5px;
`

const Header = styled.div`
  /* border: 1px solid black; */
  display: flex;
  justify-content: space-around;
  height: 50px;
`

const Title = styled.div`
  /* border: 1px solid black; */
  flex: 5;
  font-size: 2rem;
  padding: 10px 20px;
  /* border-bottom: 1px solid rgb(196, 207, 214); */
`

const PackageID = styled.div`
  /* border: 1px solid black; */
  font-size: 1rem;
  flex: 1;
  color: grey;
`

const TotalAmount = styled.div`
  /* border: 1px solid black; */
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  & > span {
    font-size: 1.5rem;
  }
`

const TimeWrapper = styled.div`
  /* border: 1px solid black; */
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
`

const LockStatus = styled.div`
  /* border: 1px solid black; */
  &.locked {
    color: red;
  }
  &.notLocked {
    color: green;
  }
`

const DeadLine = styled.div`
  /* border: 1px solid black; */
  margin-top: 5px;
  flex: 1;
`

const Body = styled.div`
  /* border: 1px solid black; */
  height: 200px;
  display: flex;
  /* border-bottom: 1px solid rgb(196, 207, 214); */
`

const Content = styled.div`
  /* border: 1px solid black; */
  width: 500px;
  padding: 10px 20px;
  font-size: 18px;
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
  /* border: 1px solid black; */
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ResultButton = styled.button`
  /* background-color: RGB(245, 192, 237);
  height: 28px;
  border-radius: 4px;
  padding: 1px 10px 1px 9px;
  font-weight: 500;
  color: #fff;
  box-sizing: border-box; */
  margin: 10px;
  color: #fff;
  background: transparent;
  border: 0px solid gray;
  border-radius: 4px;
  height: 28px;
  background-color: RGB(245, 192, 237);
  width: 80px;
  font-weight: 500;
  &:hover {
    background-color: #d6c1f5;
    color: white;
  }
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
        <TotalAmount>
          Max: <span>{packageData.totalNumber}</span>
        </TotalAmount>
        <TimeWrapper>
          <LockStatus className={packageData.isLocked ? 'locked' : 'notLocked'}>
            {packageData.isLocked ? '已结束' : '进行中'}
          </LockStatus>
          {!packageData.isLocked && (
            <DeadLine>
              <Countdown date={packageData.deadline}></Countdown>
            </DeadLine>
          )}
        </TimeWrapper>
      </Header>
      <Body>
        <Content>{content}</Content>
        <Image ref={ref}></Image>
      </Body>
      <Tail>
        {packageData.isLocked ? (
          <ResultButton onClick={() => alert('未实现')}>查看结果</ResultButton>
        ) : (
          <Share url="https://fannft.eth.link" options={{ text: content, size: 'large' }} />
        )}
      </Tail>
    </PackageInfoWrapper>
  )
}

export default PackageInfo
