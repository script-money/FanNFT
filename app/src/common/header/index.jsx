import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './index.less';
import { actionCreatorsHeader } from './store';

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
                connectWallet ? null :
                <Link to="/gift">
                  <div>
                    我的礼物
                  </div>
                </Link>
              }
            </Col>
            <Col span={15}/>
            <Col span={2} onClick={handleToggleConnectWallet}>
              <div className={connectWallet ? "walletName" : "walletNameActive"}>  
                {connectWallet ? "连接钱包" : "断开连接"}
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
    handleToggleConnectWallet() {
      dispatch(actionCreatorsHeader.toggleConnectWallet())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);