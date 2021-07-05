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

export const changeNFT = (file) => ({
  type: constants.CHANGENFT,
  file
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

export const toggleLanguage = () => ({
  type: constants.LANGUAGE,
});

export const getLanguageInfo = (language) => ({
  type: constants.LANGUAGE_INFO,
  language
});

export const getGiftsInfo = (giftsDataList) => ({
  type: constants.GIFTS_INFO,
  giftsDataList
});

export const getChangeInfoArray = (packageArr, totalNumberArr, rewardAddressArr, lockedArr, giftIDsArr) => ({
  type: constants.CHANGEINFOARRAY,
  packageArr,
  totalNumberArr,
  rewardAddressArr,
  lockedArr,
  giftIDsArr
})

export const getChangeMetaArray = (metaDataArr, packageInfoList) => ({
  type: constants.CHANGEMETAARRAY,
  value: fromJS(metaDataArr),
  packageInfoList
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
      const packageInfoList = []
      for (var i = 0; i < resdecode.length; i++) {
        packageArr.push(resdecode[i].packageID)
        metaDataArr.push(JSON.parse(resdecode[i].metadata))
        totalNumberArr.push(resdecode[i].totalNumber)
        rewardAddressArr.push(resdecode[i].rewardAddress)
        lockedArr.push(resdecode[i].locked)
        giftIDsArr.push(resdecode[i].giftIDs)

        const packageInfo = {
          packageID: resdecode[i].packageID,
          metadata: resdecode[i].metadata,
          totalNumber: resdecode[i].totalNumber,
        }
        packageInfoList.push(packageInfo)
      }
      await dispatch(getChangeMetaArray(metaDataArr, packageInfoList))
      await dispatch(getChangeInfoArray(packageArr, totalNumberArr, rewardAddressArr, lockedArr, giftIDsArr))
    } catch (error) {

    }
  }
}

export const createPackage = (event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline, userAddress) => {
  event.preventDefault()
  return async (dispatch) => {
    try {
      let metaData = JSON.stringify({
        title,
        image: nfturl, // 让用户自己上传url
        content: content + ' ' + userAddress, // 在内容后添加地址。如果是用户转发，替换成用户自己的地址
        keyWord: '#FanNFT #' + keyWord , // 使用hashtag为 "#FanNFT #[keyWord]" 才能从Twitter的API获取
        createAt: (Date.now() / 1000) | 0,
        deadline: parseInt(deadline / 1000),
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

export const giftDataInfo = (getGiftsScript, getGiftInfoScriptScript, userAddress, packageInfoList) => {
  return async (dispatch) => {
    try {
      const resGiftsID = await fcl.send([fcl.script(getGiftsScript), fcl.args([fcl.arg(userAddress, t.Address)])])
      const resDataGiftsID = await fcl.decode(resGiftsID)
      if (resDataGiftsID.length === 0) {
        dispatch(getGiftsInfo([]))
        return
      }
      const resGiftsInfo = await fcl.send([
        fcl.script(getGiftInfoScriptScript),
        fcl.args([fcl.arg(userAddress, t.Address), fcl.arg(resDataGiftsID, t.Array(t.UInt64))]),
      ])
      const resDataGiftsInfo = await fcl.decode(resGiftsInfo)
      const giftsDataList = []
      for (const giftResInfo of resDataGiftsInfo) {
        const packageInfo = packageInfoList.filter((packageInfoList) => {
          return packageInfoList.packageID === giftResInfo.packageID
        })[0]
        const metadata = JSON.parse(packageInfo.metadata)
        const giftInfo = {
          title: metadata.title,
          url: metadata.url,
          createAt: new Date(metadata.createAt),
          packageID: packageInfo.packageID,
          totalNumber: packageInfo.totalNumber,
          NFTID: giftResInfo.id,
          seriesNum: giftResInfo.serialNumber,
        }
        giftsDataList.push(giftInfo)
      }
      await dispatch(getGiftsInfo(giftsDataList))
      console.log(giftsDataList)
    } catch (error) {

    }
  }
}