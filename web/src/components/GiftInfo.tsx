import { useExternal } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { GiftInfoProps } from '../interfaces'

const GiftInfoWrapper = styled.div`
  border: 1px solid black;
  height: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  border: 1px solid black;
  max-height: 50px;
  font-size: 2rem;
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
const SeriesNumber = styled.div`
  color: grey;
`

const GiftInfo = (props: GiftInfoProps) => {
  const giftInfo = props.data
  const [imgUrl, setImgUrl] = useState('')
  const ref = useRef(null)
  const [seriesText, setSeriesText] = useState('')

  const [status, { toggle, unload, load }] = useExternal(imgUrl, {
    type: 'img',
    target: ref,
  })

  useEffect(() => {
    setImgUrl(giftInfo.url)
    setSeriesText(`# ${giftInfo.seriesNum}/${giftInfo.totalNumber}`)
    load()
  }, [])

  return (
    <GiftInfoWrapper>
      <Title>{giftInfo.title}</Title>
      <Image ref={ref}></Image>
      <SeriesNumber>{seriesText}</SeriesNumber>
    </GiftInfoWrapper>
  )
}

export default GiftInfo
