import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ReplaceAddress } from '../../config'
import { FormattedMessage } from 'react-intl'
import { actionCreatorsHeader } from '../header/store'
import './index.less'

const getGiftsScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

// 用于获取账户下的giftID

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    let collectionRef = account.getCapability(FanNFT.GiftPublicPath)
      .borrow<&{FanNFT.GiftCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")
    return collectionRef.getIDs()
}
`

const getGiftInfoScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
// 返回用户持有的giftNFT信息
pub fun main(address: Address, giftIDs: [UInt64]): [FanNFT.GiftData] {
    let collectionRef = getAccount(address).getCapability(FanNFT.GiftPublicPath)
      .borrow<&{FanNFT.GiftCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")
    let giftsData:[FanNFT.GiftData] = []
    for giftID in giftIDs{
      let giftItem = collectionRef.borrowGift(id: giftID)
          ?? panic("No such giftID in that collection")
      giftsData.append(giftItem.data)
    }
    return giftsData
}
`

const getGiftsScript = ReplaceAddress(getGiftsScriptSource)
const getGiftInfoScriptScript = ReplaceAddress(getGiftInfoScriptSource)

class Gift extends PureComponent {

  componentDidMount() {
    const packageInfoList = this.props.packageInfoList.toJS()
    const {
      userAddress,
    } = this.props
    this.props.handleGiftDataInfo(getGiftsScript, getGiftInfoScriptScript, userAddress, packageInfoList)
  }

  render() {
    return (
      <div className="giftBox">
        <div className="title">
          <FormattedMessage
            id='MyGift'
            defaultMessage="MyGift"
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  connectWallet: state.getIn(['header', 'connectWallet']),
  userAddress: state.getIn(['header', 'userAddress']),
  packageInfoList: state.getIn(['header', 'packageInfoList']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    handleGiftDataInfo(getGiftsScript, getGiftInfoScriptScript, userAddress) {
      dispatch(actionCreatorsHeader.giftDataInfo(getGiftsScript, getGiftInfoScriptScript, userAddress))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Gift);