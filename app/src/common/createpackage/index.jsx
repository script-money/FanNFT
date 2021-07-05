import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Input, DatePicker, Button, Upload, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ReplaceAddress, adminAddress } from '../../config';
import { actionCreatorsHeader } from '../header/store';
import { FormattedMessage } from 'react-intl';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import en_US from '../../locale/en_US';
import './index.less';
import { SkynetClient } from "skynet-js";

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

const client = new SkynetClient("https://siasky.net")

class CreatePackage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    }
    this.handleChange = this.handleChange.bind(this);
    this.beforeUpload = this.beforeUpload.bind(this);
  }

  componentDidUpdate() {
    if(this.props.status === 'Transaction is Sealed') {
      this.props.history.push('/')
    }
  }

  beforeUpload(file) {
    if (file.type !== 'image/png') {
      message.error(`${file.name} is not a png file`);
    }
    return false;
  }

  async handleChange(file) {
    console.log(file.file)
    try {
      // upload
      const fileString = file.file
      const { skylink } = await client.uploadFile(fileString);
      const portalUrl = await client.getSkylinkUrl(skylink);
      await this.props.handleChangeNFT(portalUrl)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const {
      totalNumber,
      transaction,
      title,
      nfturl,
      content,
      keyWord,
      deadline,
      language,
      userAddress,
      statusNumber,
      handleCreatePackage,
      handleChangeTitle,
      handleChangeContent,
      handleKeyWord,
      handleChangeGift,
      handleChangeDeadline
    } = this.props;
    const end = moment((deadline)).format('YYYY/MM/DD HH:mm:ss')
    return (
      <div className="createPackageBox">
        <div className="firstArea">
          <div className="one">
            <div className="title">
              <span>
                <FormattedMessage
                  id='CreatePackage'
                  defaultMessage="CREATE PACKAGE"
                />
              </span>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='Title'
                  defaultMessage="Title"
                />
              </span>
              <div className="input">
                {
                  language === en_US ?
                    <Input size="middle" placeholder="title" bordered={true} onChange={(e) => handleChangeTitle(e)} />
                    :
                    <Input size="middle" placeholder="礼包标题" bordered={true} onChange={(e) => handleChangeTitle(e)} />
                }
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='NFTURL'
                  defaultMessage="NFTURL"
                />
              </span>
              <div className="input">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={this.beforeUpload}
                  onChange={this.handleChange}
                >
                  <Button icon={<UploadOutlined />}>
                    <FormattedMessage
                      id='UploadPng'
                      defaultMessage="Upload png only"
                    />
                  </Button>
                </Upload>
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='Content'
                  defaultMessage="Content"
                />
              </span>
              <div className="input">
                {
                  language === en_US ?
                    <TextArea size="middle" placeholder="input the content(max 140 words)" bordered={true} onChange={(e) => handleChangeContent(e)} maxLength={140} />
                    :
                    <TextArea size="middle" placeholder="填写转发内容（必填，最大140字）" bordered={true} onChange={(e) => handleChangeContent(e)} maxLength={140} />
                }
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='Keyword'
                  defaultMessage="Keyword"
                />
              </span>
              <div className="input">
                {
                  language === en_US ?
                    <Input size="middle" placeholder="used for twitter queries" bordered={true} onChange={(e) => handleKeyWord(e)} />
                    :
                    <Input size="middle" placeholder="用于推特查询" bordered={true} onChange={(e) => handleKeyWord(e)} />
                }
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='GiftNumber'
                  defaultMessage="Gift Number"
                />
              </span>
              <div className="input">
                {
                  language === en_US ?
                    <Input type="number" size="middle" placeholder="Gift Number" bordered={true} onChange={(e) => handleChangeGift(e)} />
                    :
                    <Input type="number" size="middle" placeholder="礼物总数" bordered={true} onChange={(e) => handleChangeGift(e)} />
                }
              </div>
            </div>
            <div className="inputBox">
              <span className="inputTitle">
                <FormattedMessage
                  id='Deadline'
                  defaultMessage="Deadline"
                />
              </span>
              <div className="input">
                {
                  language === en_US ?
                    <DatePicker showTime style={{ width: '2.45rem' }} onChange={(e) => handleChangeDeadline(e)} />
                    :
                    <DatePicker locale={locale} style={{ width: '2.45rem' }} showTime onChange={(e) => handleChangeDeadline(e)} />
                }

              </div>
            </div>
            <div className="previewBox">
              <div className="title">
                <span>
                  <FormattedMessage
                    id='Preview'
                    defaultMessage="Preview"
                  />
                </span>
              </div>
              <div className="preview">
                <div className="title">
                  <span>{title}</span>
                </div>
                <div className="locked">
                  <span>
                    <FormattedMessage
                      id='Progress'
                      defaultMessage="Progress"
                    />
                  </span>
                </div>
                <div className="contentBox">
                  <div className="contentText">{content}</div>
                  <div className="deadlineText">
                    <FormattedMessage
                      id='Deadline'
                      defaultMessage="Deadline"
                    /> {end}</div>
                  <div className="imageBox">
                    <img src={nfturl} alt="" />
                  </div>
                  <div className="totalText">
                    <FormattedMessage
                      id='GiftNumber'
                      defaultMessage="Gift Number"
                    /> {totalNumber}</div>
                </div>
                <div className="button">
                  <Button type="primary" shape="round" size="large">
                    转发到我的推特
                    </Button>
                </div>
              </div>
            </div>
            {
              statusNumber === 0 ?
                <div className="buttonBox">
                  <Button type="primary" shape="round" size="large" onClick={nfturl !== '' ? (event) => handleCreatePackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline, userAddress) : ''}>
                    <FormattedMessage
                      id='Create'
                      defaultMessage="Create"
                    />
                  </Button>
                </div>
                :
                <div className="buttonBox">
                  <Button type="primary" shape="round" size="large" style={{ width: '90.25px' }}>
                    <LoadingOutlined style={{ fontSize: '16px' }} />
                  </Button>
                </div>
            }
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
  language: state.getIn(['header', 'language']),
  userAddress: state.getIn(['header', 'userAddress']),
  statusNumber: state.getIn(['header', 'statusNumber']),
  status: state.getIn(['header', 'status']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    handleCreatePackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline, userAddress) {
      dispatch(actionCreatorsHeader.createPackage(event, setUpAccountTransaction, totalNumber, adminAddress, transaction, title, nfturl, content, keyWord, deadline, userAddress))
    },
    handleChangeTitle(e) {
      dispatch(actionCreatorsHeader.changeTitle(e))
    },
    handleChangeNFT(file) {
      dispatch(actionCreatorsHeader.changeNFT(file))
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
    handleChangeStatus(value,num) {
      dispatch(actionCreatorsHeader.changeStatus(value,num))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackage);