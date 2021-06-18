import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Input, InputNumber, DatePicker, Button } from 'antd';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import moment from 'moment';
import { ReplaceAddress, adminAddress } from '../../config';
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

const { TextArea } = Input

class CreatePackage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    }
    this.onChange = this.onChange.bind(this);
  }

  onChange(date, dateString) {
    console.log(date, dateString);
  }

  render() {
    const {
      metadata,
      totalNumber,
      transaction,
      title,
      nfturl,
      content,
      keyWord,
      deadline,
      handleCreatePackage,
      handleChangeTitle,
      handleChangeNFT,
      handleChangeContent,
      handleKeyWord,
      handleChangeGift,
      handleChangeDeadline
    } = this.props;
    const end = moment((deadline)).format('YYYY/MM/DD HH:mm:ss')
    console.log(deadline)

    return (
      <div className="createPackageBox">
        <div className="firstArea">
          <div className="one">
            <div className="title">
              <span>创建礼包</span>
            </div>
            <div className="inputBox">
              <span className="inputTitle">礼包标题</span>
              <div className="input">
                <Input size="middle" placeholder="礼包标题" bordered={true} onChange={(e) => handleChangeTitle(e)} />
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">NFT资源</span>
              <div className="input">
                <Input size="middle" placeholder="输入URL" bordered={true} onChange={(e) => handleChangeNFT(e)} />
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">转发内容</span>
              <div className="input">
                <TextArea size="middle" placeholder="填写转发内容（必填，最大140字）" bordered={true} onChange={(e) => handleChangeContent(e)} maxLength={140} />
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">关键词</span>
              <div className="input2">
                <Input size="middle" placeholder="用于推特查询" bordered={true} onChange={(e) => handleKeyWord(e)} />
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">礼物总数</span>
              <div className="input">
                <Input type="number" size="middle" placeholder="礼物总数" bordered={true} onChange={(e) => handleChangeGift(e)} />
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">截止日期</span>
              <div className="input">
                <DatePicker showTime onChange={(e) => handleChangeDeadline(e)} />
              </div>
            </div>
            <div className="previewBox">
              <div className="title">
                <span>预览</span>
              </div>
              <div className="preview">
                <div className="title">
                  <span>{title}</span>
                </div>
                <div className="locked">
                  <span>进行中</span>
                </div>
                <div className="contentBox">
                  <div className="contentText">{content}</div>
                  <div className="deadlineText">截止日期 {end}</div>
                  <div className="imageBox">
                    <img src={nfturl} alt="" />
                  </div>
                  <div className="totalText">总量 {totalNumber}</div>
                </div>
                <div className="button">
                  <Button type="primary" shape="round" size="large">
                    转发到我的推特
                    </Button>
                </div>
              </div>
            </div>
            <div className="buttonBox">
              <Button type="primary" shape="round" size="large" onClick={(event) => handleCreatePackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline)}>
                创  建
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  metadata: state.getIn(['header', 'metadata']),
  totalNumber: state.getIn(['header', 'totalNumber']),
  transaction: state.getIn(['header', 'transaction']),
  title: state.getIn(['header', 'title']),
  nfturl: state.getIn(['header', 'nfturl']),
  content: state.getIn(['header', 'content']),
  keyWord: state.getIn(['header', 'keyWord']),
  deadline: state.getIn(['header', 'deadline']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    handleCreatePackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline) {
      dispatch(actionCreatorsHeader.createPackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline))
    },
    handleChangeTitle(e) {
      dispatch(actionCreatorsHeader.changeTitle(e))
    },
    handleChangeNFT(e) {
      dispatch(actionCreatorsHeader.changeNFT(e))
    },
    handleChangeContent(e) {
      dispatch(actionCreatorsHeader.changeContent(e))
    },
    handleKeyWord(e) {
      dispatch(actionCreatorsHeader.changeKeyword(e))
    },
    handleChangeGift(e) {
      dispatch(actionCreatorsHeader.changeGift(e))
    },
    handleChangeDeadline(e) {
      if (e != null) {
        dispatch(actionCreatorsHeader.changeDeadline(e))
      }
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackage);