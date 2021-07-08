import { useState, useContext, useEffect } from 'react'
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
  /* border: 1px solid green; */
  display: flex;
`

const CreateForm = styled.div`
  /* border: 1px solid red; */
  margin-left: 20px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const PreviewWrapper = styled.div`
  /* border: 1px solid yellow; */
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: flex-start;
`

const Field = styled.div`
  /* border: 1px solid purple; */
  display: flex;
  margin-bottom: 20px;
`

const Title = styled.div`
  display: flex;
  color: gray;
  min-width: 100px;
  font-size: 1.4rem;
`

const TitleInput = styled.input`
  width: 300px;
`

const UrlInput = styled.input`
  width: 500px;
`

const ContentTextera = styled.textarea`
  width: 500px;
  height: 150px;
`

const KeyWordInput = styled.input`
  width: 100px;
`

const TotalNumberInput = styled.input`
  width: 100px;
`

const DatePickerWrapper = styled.div`
  & .form-control {
    width: 180px;
    height: 32px;
  }
`

const Confirm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const ConfirmButton = styled.button`
  margin: 10px;
  color: gray;
  background: transparent;
  border: 2px solid gray;
  border-radius: 16px;
  height: 50px;
  width: 100px;
  font-size: 16px;
  &:hover {
    background-color: RGB(245, 192, 237);
    color: white;
  }
`

const createPackageTransactionSource = `\
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
// import FlowToken from 0x0ae53cb6e3f42a79 // 模拟器
// import FlowToken from 0x7e60df042a9c0868 // 测试网
import FungibleToken from "../../contracts/FungibleToken.cdc"
// import FungibleToken from 0xee82856bf20e2aa6 // 模拟器
// import FungibleToken from 0x9a0766d93b6608b7 // 测试网

transaction(metadata: String, totalNumber: UInt32, adminAccount: Address) {
  let sentVault: @FungibleToken.Vault
  
  prepare(acct: AuthAccount){
    let amount = FanNFT.createFee
    let vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
			?? panic("Could not borrow reference to the owner's Vault!")
    self.sentVault <- vaultRef.withdraw(amount: amount)
  }

  execute {
    let admin = getAccount(adminAccount)
    let adminRef = admin.getCapability(FanNFT.AdminPublicPath).borrow<&{FanNFT.AdminPublic}>()!
    let receiverRef = admin
      .getCapability(/public/flowTokenReceiver)
      .borrow<&{FungibleToken.Receiver}>()
			?? panic("Could not borrow receiver reference to the recipient's Vault")
    receiverRef.deposit(from: <-self.sentVault)

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

  useEffect(() => {
    if (status === 'Transaction is Sealed') {
      window.location.href = '/home'
    }
  }, [status])

  const OnSubmit = async (event: any) => {
    if (title === '' || url === '' || retweet === '' || keyword === '') {
      alert('部分参数未填写请检查参数')
      return
    }
    if (totalNumber < 1 || totalNumber > 99) {
      alert('礼物数量为1-99')
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
          console.log(`Transaction ${transactionId} is Sealed`)
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
              <TitleInput
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：the gift to Flow fans"
              ></TitleInput>
            </Field>
            <Field>
              <Title>NFT资源</Title>
              <UrlInput type="url" onChange={(e) => setUrl(e.target.value)} placeholder="输入URL"></UrlInput>
            </Field>
            <Field>
              <Title>转发内容</Title>
              <ContentTextera
                onChange={(e) => setRetweet(e.target.value + ' ' + sessionUser.addr)}
                placeholder="填写转发内容"
              ></ContentTextera>
            </Field>
            <Field>
              <Title>关键词</Title>
              <KeyWordInput
                type="text"
                onChange={(e) => setKeyword('#FanNFT #' + e.target.value)}
                placeholder="填写关键词"
              ></KeyWordInput>
            </Field>
            <Field>
              <Title>礼物总数</Title>
              <TotalNumberInput
                type="number"
                min="1"
                max="99"
                onChange={(e) => setTotalNumber((e.currentTarget as any).value)}
                placeholder="填写礼物总数"
              ></TotalNumberInput>
            </Field>
            <Field>
              <Title>截止日</Title>
              <DatePickerWrapper>
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
              </DatePickerWrapper>
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
