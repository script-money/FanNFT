import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './index.less';
import { actionCreatorsHeader } from './store';
import * as fcl from '@onflow/fcl'

class Header extends PureComponent{
  constructor(props) {
    super(props);
    this.state = {
      left: 0
    }
  }
  componentDidMount() {
    let that = this;
    window.onscroll = function () {
      let sl = -Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
      let left = (sl) + 'px';
      that.setState({
        left: left
      });
    }
  }
  render(){
    const {
      handleToggleConnectWallet,
      connectWallet
    } = this.props;
    return (
      <div className="header">
        <div className="headerBox" style={{left: this.state.left}}>
          <Row>
            <Col span={1} />
            <Col span={2}>
              <Link to="/">
                <div className="logo" alt="" />
              </Link>
            </Col>
            <Col span={1}/>
            <Col span={2}>
              {
                connectWallet ?
                <Link to="/gift">
                  <div>
                    我收到的礼物
                  </div>
                </Link>
                : null
              }
            </Col>
            <Col span={15}/>
            <Col span={2} onClick={(event) => handleToggleConnectWallet(event,connectWallet)}>
              <div className={connectWallet ? "walletNameActive" : "walletName"}>  
                {connectWallet ? "断开连接" : "连接钱包"}
              </div>
            </Col>
            <Col span={1}/>
          </Row>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  connectWallet: state.getIn(['header', 'connectWallet']),
});

const mapDispatchToProps = (dispatch) => {
  return{
    handleToggleConnectWallet(event,connectWallet) {
      dispatch(actionCreatorsHeader.toggleConnectWallet(event,connectWallet))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);