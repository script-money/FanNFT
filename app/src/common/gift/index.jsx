import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { ReplaceAddress } from '../../config'
import './index.less';

class Gift extends PureComponent{

  

  render(){
    const {

    } = this.props;

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

    const getGiftsScript = ReplaceAddress(getGiftsScriptSource)


    return (
      <div className="giftBox">
          liwu
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  connectWallet: state.getIn(['header', 'connectWallet']),
});

const mapDispatchToProps = (dispatch) => {
  return{
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Gift);