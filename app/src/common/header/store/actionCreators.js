import * as constants from './constants'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import {
  fromJS
} from 'immutable'
import moment from 'moment'

export const userInfo = (user) => ({
  type: constants.USERINFO,
  user
})

export const getDataInfo = (resdecode) => ({
  type: constants.DATAINFO,
  resdecode
})

export const connectWalletWord = (connectWallet) => ({
  type: constants.CONNECTWALLET,
  connectWallet
})

export const changeStatus = (value) => ({
  type: constants.CHANGESTATUS,
  value
})

export const changeTransaction = (value) => ({
  type: constants.CHANGETRANSACTION,
  value
})

export const changeTitle = (e) => ({
  type: constants.CHANGETITLE,
  value: e.target.value
})

export const changeNFT = (e) => ({
  type: constants.CHANGENFT,
  value: e.target.value
})

export const changeContent = (e) => ({
  type: constants.CHANGECONTENT,
  value: e.target.value
})

export const changeKeyword = (e) => ({
  type: constants.CHANGEKEYWORD,
  value: e.target.value
})

export const changeGift = (e) => ({
  type: constants.CHANGEGIFT,
  value: e.target.value
})

export const changeDeadline = (e) => ({
  type: constants.CHANGEDEADLINE,
  value: moment(e).valueOf()
  // value: moment(e.format('YYYY-MM-DD')).valueOf()
})

export const changeMetaData = (metaData) => ({
  type: constants.CHANGEMETADATA,
  metaData
})

export const getAddress = (address) => ({
  type: constants.GETADDRESS,
  address
})

export const getChangeInfoArray = (packageArr, totalNumberArr, rewardAddressArr, lockedArr, giftIDsArr) => ({
  type: constants.CHANGEINFOARRAY,
  packageArr,
  totalNumberArr,
  rewardAddressArr,
  lockedArr,
  giftIDsArr
})

export const getChangeMetaArray = (metaDataArr) => ({
  type: constants.CHANGEMETAARRAY,
  value: fromJS(metaDataArr)
})

export const toggleConnectWallet = (event, connectWallet) => {
  event.preventDefault()
  return async (dispatch) => {
    try {
      if (connectWallet) {
        await fcl.unauthenticate()
      } else {
        await fcl.authenticate()
        await fcl.currentUser().subscribe((user) => {
          let address = user.addr
          dispatch(getAddress(address))
        })
      }
      await dispatch(connectWalletWord())
    } catch (err) {}
  }
}

export const dataInfo = (getPackagesScript) => {
  return async (dispatch) => {
    try {
      let res = await fcl.send([fcl.script(getPackagesScript)])
      let resdecode = await fcl.decode(res)
      await dispatch(getDataInfo(resdecode))
      const packageArr = []
      const metaDataArr = []
      const totalNumberArr = []
      const rewardAddressArr = []
      const lockedArr = []
      const giftIDsArr = []
      for(var i = 0; i < resdecode.length; i++) {
        packageArr.push(resdecode[i].packageID)
        metaDataArr.push(JSON.parse(resdecode[i].metadata))
        totalNumberArr.push(resdecode[i].totalNumber)
        rewardAddressArr.push(resdecode[i].rewardAddress)
        lockedArr.push(resdecode[i].locked)
        giftIDsArr.push(resdecode[i].giftIDs)
      }
      await dispatch(getChangeMetaArray(metaDataArr))
      await dispatch(getChangeInfoArray(packageArr, totalNumberArr, rewardAddressArr, lockedArr, giftIDsArr))
    } catch (error) {

    }
  }
}

export const createPackage = (event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline) => {
  event.preventDefault()
  return async (dispatch) => {
    try {
      let metaData = JSON.stringify({
        title,
        image: nfturl, // 让用户自己上传url
        content: content + ' ', // 在内容后添加地址。如果是用户转发，替换成用户自己的地址
        keyWord: '#FanNFT #' + '[' + keyWord + ']', // 使用hashtag为 "#FanNFT #[keyWord]" 才能从Twitter的API获取
        createAt: (Date.now() / 1000) | 0,
        deadline,
      })
      console.log('metaData', metaData)
      await dispatch(changeMetaData(metaData))
      let resolveing = 'Resolving...'
      await dispatch(changeStatus(resolveing))
      let blockResponse = await fcl.send([fcl.getLatestBlock()])
      let block = await fcl.decode(blockResponse)
      let {
        transactionId
      } = await fcl.send([
        fcl.transaction(setUpAccountTransaction),
        fcl.args([
          fcl.arg(metaData, t.String),
          fcl.arg(Number(totalNumber), t.UInt32),
          fcl.arg(adminAddress, t.Address),
        ]),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.authorizations([fcl.currentUser().authorization]),
        fcl.payer(fcl.currentUser().authorization),
        fcl.ref(block.id),
        fcl.limit(999),
      ])
      let transactionIdValue = await 'Transaction sent, waiting for confirmation' + ' trxId: ' + transactionId
      await dispatch(changeStatus(transactionIdValue))


      let unsub = await fcl.tx({
        transactionId
      }).subscribe((transaction) => {
        dispatch(changeTransaction(transaction))
        if (fcl.tx.isSealed(transaction)) {
          let sealedValue = 'Transaction is Sealed'
          dispatch(changeStatus(sealedValue))
          unsub()
        }
      })
    } catch (error) {

    }
  }
}