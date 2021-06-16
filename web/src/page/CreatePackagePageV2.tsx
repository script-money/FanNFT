import { useState, createContext, useContext } from 'react'
import styled from 'styled-components'
import Content from '../app/Content'
import PackageInfo from '../components/PackageInfo'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import zh from 'date-fns/locale/zh-CN'
import { SessionUserContext } from '../app/Authenticate'
import { ReplaceAddress, adminAddress } from '../config'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { PackageInfoDisplay } from '../interfaces'

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

const ImageContainer = styled.div`
  max-width: 200px;
  height: 200px;
  /* visibility: hidden; */
`

const Confirm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const ConfirmButton = styled.button`
  margin: 10px;
  background-color: green;
`

const createPackageTransactionSource = `\
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"
transaction(metadata: String, totalNumber: UInt32, adminAccount: Address) {
  prepare(acct: AuthAccount){
    log(acct)
  }
  execute {
    let admin = getAccount(adminAccount)
    let adminRef = admin.getCapability(FanNFT.AdminPublicPath).borrow<&{FanNFT.AdminPublic}>()!
    adminRef.createPackage(metadata: metadata, totalNumber: totalNumber)
  }
}
`

const setUpAccountTransaction = ReplaceAddress(createPackageTransactionSource)

const CreatePackagePageV2 = () => {
  const sessionUser = useContext(SessionUserContext)

  const [packageID, setPackageID] = useState(-1)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [retweet, setRetweet] = useState('')
  const [keyword, setKeyword] = useState('')
  const [totalNumber, setTotalNumber] = useState(0)
  const [createAt, setCreateAt] = useState(new Date())
  const [deadline, setDeadline] = useState(new Date())
  const [isLocked, setIsLocked] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [status, setStatus] = useState('Not started')

  const OnSubmit = async (event: any) => {
    if (title === '' || url === '' || retweet === '' || keyword === '') {
      alert('部分参数未填写请检查参数')
      return
    }
    const metadata = JSON.stringify({
      title,
      url,
      content: retweet,
      keyWord: keyword,
      createAt: (Date.now() / 1000) | 0,
      deadline: (deadline.getTime() / 1000) | 0,
    })

    event.preventDefault()
    const blockResponse = await fcl.send([fcl.getLatestBlock()])
    const block = await fcl.decode(blockResponse)

    try {
      const { transactionId } = await fcl.send([
        fcl.transaction(setUpAccountTransaction),
        fcl.args([
          fcl.arg(metadata, t.String),
          fcl.arg(Number(totalNumber), t.UInt32),
          fcl.arg(adminAddress, t.Address),
        ]),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.authorizations([fcl.currentUser().authorization]),
        fcl.payer(fcl.currentUser().authorization),
        fcl.ref(block.id),
        fcl.limit(999),
      ])

      setStatus('Transaction sent, waiting for confirmation' + ' trxId: ' + transactionId)

      const unsub = fcl.tx({ transactionId }).subscribe((transaction: React.SetStateAction<null>) => {
        setTransaction(transaction)

        if (fcl.tx.isSealed(transaction)) {
          setStatus('Transaction is Sealed')
          alert('Transaction is Sealed')
          unsub()
        }
      })
    } catch (error) {
      alert('Transaction failed: ' + error)
      setStatus('Transaction failed: ' + error)
    }
  }

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
                max="99"
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
                selected={deadline}
                onChange={(date: Date) => {
                  setDeadline(date)
                }}
                minDate={createAt}
                maxDate={new Date(Date.now() + 3600 * 1000 * 24 * 7)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={5}
                timeCaption="time"
                dateFormat="yyyy-MM-dd h:mm aa"
              />
            </Field>
          </CreateForm>
          <PreviewWrapper>
            <PackageInfo
              data={
                {
                  packageID,
                  title,
                  url,
                  retweet,
                  keyword,
                  totalNumber,
                  createAt,
                  deadline,
                  isLocked,
                } as PackageInfoDisplay
              }
            />
          </PreviewWrapper>
        </Container>
        <Confirm>
          <ConfirmButton onClick={OnSubmit}>确认创建</ConfirmButton>
        </Confirm>
      </Content>
    </>
  )
}

export default CreatePackagePageV2
