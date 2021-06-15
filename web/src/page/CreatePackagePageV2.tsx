import { useRef, useState, createContext, useContext } from 'react'
import styled from 'styled-components'
import Content from '../app/Content'
import PackageInfo from '../components/PackageInfo'
import { useExternal } from 'ahooks'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import zh from 'date-fns/locale/zh-CN'
import { SessionUserContext } from '../app/Authenticate'
registerLocale('zh', zh)

const Container = styled.div`
  border: 1px solid green;
  display: flex;
`

const CreateForm = styled.div`
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const PreviewWrapper = styled.div`
  border: 1px solid yellow;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`

const Field = styled.div`
  border: 1px solid purple;
  display: flex;
`

const Title = styled.div`
  display: flex;
  color: gray;
  min-width: 100px;
`

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const ImageLoader = styled.div`
  display: flex;
`

interface PackageData {
  title: string
  url: string
  retweet: string
  keyword: string
  totalNumber: number
  createAt: Date
  deadline: Date
}

export const PackageDataContext = createContext<PackageData>({
  title: '',
  url: '',
  retweet: '',
  keyword: '#FanNFT',
  totalNumber: 0,
  createAt: new Date(),
  deadline: new Date(),
})

const CreatePackagePageV2 = () => {
  // const [sessionUser, _] = useState<SessionUser>(
  //   () => (sessionStorage.getItem('CURRENT_USER') as unknown) as SessionUser
  // )
  const sessionUser = useContext(SessionUserContext)

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [retweet, setRetweet] = useState('')
  const [keyword, setKeyword] = useState('')
  const [totalNumber, setTotalNumber] = useState(0)
  const [createAt, setCreateAt] = useState(new Date())
  const [deadline, setDeadline] = useState(new Date())

  const ref = useRef(null)

  const [status, { toggle, load, unload }] = useExternal(url, {
    type: 'img',
    target: ref,
  })

  // const metaString = useMemo(
  //   () =>  JSON.stringify({
  //       title,
  //       url,
  //       retweet,
  //       keyword,
  //       totalNumber,
  //       createAt,
  //       deadline,
  //     }),
  //   [title, url, retweet, keyword, totalNumber, deadline]
  // )

  return (
    <>
      <Content title="创建礼包">
        <Container>
          <CreateForm>
            <Field>
              <Title>礼包标题</Title>
              <input onChange={(e) => setTitle(e.target.value)} placeholder="例如：the gift to Flow fans"></input>
            </Field>
            <Field>
              <Title>NFT资源</Title>
              <ImageWrapper>
                <input onChange={(e) => setUrl(e.target.value)} placeholder="输入URL"></input>
                <ImageLoader>
                  <button onClick={() => load()}>preview</button>
                  <p>
                    Status: <b>{status}</b>
                  </p>
                </ImageLoader>
                <div ref={ref}></div>
              </ImageWrapper>
            </Field>
            <Field>
              <Title>转发内容</Title>
              <input
                onChange={(e) => setRetweet(e.target.value + ' ' + sessionUser.addr)}
                placeholder="填写转发内容"
              ></input>
            </Field>
            <Field>
              <Title>关键词</Title>
              <input onChange={(e) => setKeyword('#FanNFT #' + e.target.value)} placeholder="填写转发内容"></input>
            </Field>
            <Field>
              <Title>礼物总数</Title>
              <input
                type="number"
                max="100"
                onChange={(e) => setTotalNumber((e.currentTarget as any).value)}
                placeholder="礼物总数"
              ></input>
            </Field>
            <Field>
              <Title>截止日</Title>
              <DatePicker
                locale="zh"
                isClearable
                name="deadline"
                className={'form-control'}
                selected={createAt}
                onChange={(val: any) => {
                  setDeadline(val)
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={5}
                timeCaption="time"
                dateFormat="yyyy-MM-dd h:mm aa"
              />
            </Field>
          </CreateForm>
          <PreviewWrapper>
            <PackageDataContext.Provider
              value={{
                title,
                url,
                retweet,
                keyword,
                totalNumber,
                createAt,
                deadline,
              }}
            >
              <PackageInfo />
            </PackageDataContext.Provider>
          </PreviewWrapper>
        </Container>
      </Content>
    </>
  )
}

export default CreatePackagePageV2
