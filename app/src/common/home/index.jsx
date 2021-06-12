import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ReplaceAddress } from '../../config';
import { actionCreatorsHeader } from '../header/store';
import './index.less';

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

const getPackagesScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"

// 获取所有package的数据
pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}
`;

const getPackagesScript = ReplaceAddress(getPackagesScriptSource);

class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      left: 0
    }
  }

  render() {
    const {
      handleDataInfo,
      data
    } = this.props;
    return (
      <div className="homeBox">
        <div className="firstArea">
          <div className="one">
          </div>
          <div className="one">
          </div>
          <div className="one">
          </div>
          <div className="one" onClick={(event) => handleDataInfo(event,getPackagesScript)}>
            获取进行活动的data数据{data}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  data: state.getIn(['header', 'data']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    handleDataInfo(event,getPackagesScript) {
      dispatch(actionCreatorsHeader.dataInfo(event,getPackagesScript))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);