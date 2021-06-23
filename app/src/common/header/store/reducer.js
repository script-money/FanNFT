import {
  fromJS
} from 'immutable'
import * as constants from './constants'
// import zh_CN from '../../../locale/zh_CN'
import en_US from '../../../locale/en_US'

const defaultState = fromJS({
  user: [],
  connectWallet: false,
  data: null,
  status: 'Not started',
  transaction: null,
  title: '',
  totalNumber: 0,
  nfturl: '',
  content: '',
  keyWord: '',
  deadline: (Date.now() / 1000) | (3 * 60),
  metadata: '',
  packageArr: [],
  metaDataArr: [],
  totalNumberArr: [],
  rewardAddressArr: [],
  lockedArr: [],
  giftIDsArr: [],
  userAddress: '',
  language: en_US,
  toggleLanguage: true,
})

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.CONNECTWALLET:
      return state.merge({
        connectWallet: !state.get('connectWallet'),
      })
    case constants.USERINFO:
      return state.merge({
        'user': action.user,
      })
    case constants.DATAINFO:
      return state.set('data', action.resdecode)
    case constants.CHANGEMETAARRAY:
      return state.set('metaDataArr', action.value)
    case constants.CHANGESTATUS:
      return state.merge({
        'status': action.value,
      })
    case constants.CHANGETRANSACTION:
      return state.merge({
        'transaction': action.value,
      })
    case constants.CHANGETITLE:
      return state.merge({
        'title': action.value,
      })
    case constants.CHANGENFT:
      return state.merge({
        'nfturl': action.value,
      })
    case constants.CHANGECONTENT:
      return state.merge({
        'content': action.value,
      })
    case constants.CHANGEKEYWORD:
      return state.merge({
        'keyWord': action.value,
      })
    case constants.CHANGEGIFT:
      return state.merge({
        'totalNumber': Number(action.value),
      })
    case constants.CHANGEDEADLINE:
      return state.merge({
        'deadline': action.value,
      })
    case constants.CHANGEMETADATA:
      return state.merge({
        'metadata': action.metadata,
      })
    case constants.GETADDRESS:
      return state.merge({
        'userAddress': action.address,
      })
    case constants.CHANGEINFOARRAY:
      return state.merge({
        'packageArr': action.packageArr,
        'totalNumberArr': action.totalNumberArr,
        'rewardAddressArr': action.rewardAddressArr,
        'lockedArr': action.lockedArr,
        'giftIDsArr': action.giftIDsArr,
      })
    case constants.LANGUAGE:
      return state.merge({
        'toggleLanguage': !state.get('toggleLanguage'),
      })
    case constants.LANGUAGE_INFO:
      return state.set('language', action.language)
    default:
      return state;
  }
}