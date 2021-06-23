import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './index.less';
import { actionCreatorsHeader } from './store';
import { FormattedMessage } from 'react-intl';
import * as fcl from '@onflow/fcl';
import en_US from '../../locale/en_US';
import zh_CN from '../../locale/zh_CN';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      left: 0
    }
  }

  componentDidMount() {
    let that = this;
    // let user = fcl.currentUser().subscribe(this.props.user);
    // this.props.handleUserInfo(user);
    window.onscroll = function () {
      let sl = -Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
      let left = (sl) + 'px';
      that.setState({
        left: left
      });
    }
    this.props.chooseLanguage(en_US);
  }
  render() {
    const {
      handleToggleConnectWallet,
      connectWallet,
      userAddress,
      toggleLanguage,
      handleToggleLanguage,
      chooseLanguage
    } = this.props;
    return (
      <div className="header">
        <div className="headerBox" style={{ left: this.state.left }}>
          <Row>
            <Col span={1} />
            <Col span={2}>
              <Link to="/">
                <div className="logo" alt="" />
              </Link>
            </Col>
            <Col span={1} />
            <Col span={2}>
              {
                connectWallet ?
                  <Link to="/gift">
                    <div>
                      <FormattedMessage
                        id='MyGift'
                        defaultMessage="MY GIFTS"
                      />
                    </div>
                  </Link>
                  : null
              }
            </Col>
            <Col span={7} />
            <Col span={3}>
              {
                connectWallet ?
                  <Link to="/createpackage">
                    <div>
                    <FormattedMessage
                        id='CreatePackage'
                        defaultMessage="CREATE PACKAGE"
                      />
                  </div>
                  </Link>
                  : null
              }
            </Col>
            <Col span={1} />
            <Col span={3} onClick={(event) => handleToggleConnectWallet(event, connectWallet)}>
              <div className={connectWallet ? "walletNameActive" : "walletName"}>
                {connectWallet ?
                  <span>{userAddress}</span>
                  :
                  <FormattedMessage
                    id='ConnectWallet'
                    defaultMessage="CONNECT WALLET"
                  />
                }
              </div>
            </Col>
            <Col span={1} />
            <Col span={2} onClick={handleToggleLanguage}>
              <div className={toggleLanguage ? "toggleLanguage" : "toggleLanguageActive"}>
                <FormattedMessage
                  id='language'
                  defaultMessage="ENGLISH"
                  className="language"
                />
                <div className="arrow"></div>
                <ul className="languageList">
                  <li onClick={() => chooseLanguage(zh_CN)}>简体中文</li>
                  <li onClick={() => chooseLanguage(en_US)}>ENGLISH</li>
                </ul>
              </div>
            </Col>
            <Col span={1} />
          </Row>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  connectWallet: state.getIn(['header', 'connectWallet']),
  user: state.getIn(['header', 'user']),
  userAddress: state.getIn(['header', 'userAddress']),
  language: state.getIn(['header', 'language']),
  toggleLanguage: state.getIn(['header', 'toggleLanguage']),
});

const mapDispatchToProps = (dispatch) => {
  return {
    handleToggleConnectWallet(event, connectWallet) {
      dispatch(actionCreatorsHeader.toggleConnectWallet(event, connectWallet))
    },
    handleUserInfo(user) {
      dispatch(actionCreatorsHeader.userInfo(user))
    },
    handleToggleLanguage() {
      dispatch(actionCreatorsHeader.toggleLanguage());
    },
    chooseLanguage(language) {
      dispatch(actionCreatorsHeader.getLanguageInfo(language));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);