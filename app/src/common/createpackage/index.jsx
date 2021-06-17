import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Input, DatePicker } from 'antd';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { ReplaceAddress, adminAddress } from '../../config';
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

class CreatePackage extends PureComponent{
  constructor(props) {
    super(props);
    this.state = {
      remainTimes: 0,
      view: '00:00'
    }
    this.onChange = this.onChange.bind(this);
  }
  
  onChange(date, dateString) {
    console.log(date, dateString);
  }

  render(){
    const {

    } = this.props;

    return (
      <div className="createPackageBox">
        <div className="firstArea">
          <div className="one">
            <div className="title">
              <span>创建礼包</span>
            </div>
            <div className="input1">
              <span className="inputTitle">礼包标题</span>
              <div className="inputInput">
                <Input size="middle" placeholder="礼包标题" bordered={true}/>
              </div>
            </div>
            <div className="input1">
              <span className="inputTitle">NFT资源</span>
              <div className="inputInput">
                <Input size="middle" placeholder="NFT资源" bordered={true}/>
              </div>
            </div>
            <div className="input1">
              <span className="inputTitle">转发内容</span>
              <div className="inputInput">
                <Input size="middle" placeholder="转发内容" bordered={true}/>
              </div>
            </div>
            <div className="input1">
              <span className="inputTitle">关键词</span>
              <div className="inputInput">
                <Input size="middle" placeholder="关键词" bordered={true}/>
              </div>
            </div>
            <div className="input1">
              <span className="inputTitle">礼物总数</span>
              <div className="inputInput">
                <Input size="middle" placeholder="礼物总数" bordered={true}/>
              </div>
            </div>
            <div className="input1">
              <span className="inputTitle">截止日期</span>
              <div className="inputInput">
                <DatePicker onChange={this.onChange}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => {
  return{
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackage);