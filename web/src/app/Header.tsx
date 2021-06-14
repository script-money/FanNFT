import { Component } from 'react'
import styled from 'styled-components'
import logoPic from '../assets/logo.png'
import Authenticate from '../app/Authenticate'
import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom'
import CreatePackagePage from '../page/CreatePackagePage'
import MyGiftsPage from '../page/MyGiftsPage'
import GetPackagesPage from '../page/GetPackagesPage'

const HeaderWrapper = styled.div`
  height: 56px;
  background: white;
`
const Logo = styled.a`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100px;
  height: 56px;
  background: url(${logoPic});
  background-size: contain;
`
export const Nav = styled.div`
  width: 960px;
  height: 100%;
  margin: 0 auto;
`

export const NavItem = styled.div`
  line-height: 56px;
  padding: 0 15px;
  font-size: 17px;
  color: #333;
  &.left {
    float: left;
  }
  &.right {
    float: right;
  }
  &.active {
    color: #ea6f5a;
  }
`

class Header extends Component {
  render() {
    return (
      <Router>
        <HeaderWrapper>
          <Logo href="/" />
          <Nav>
            <NavItem className="left active">
              <Link to="/">首页</Link>
            </NavItem>
            <NavItem className="left">
              <Link to="/gift">我的礼物</Link>
            </NavItem>
            <NavItem className="right">
              <Authenticate />
            </NavItem>
            <NavItem className="right">
              <Link to="/create">创建礼包</Link>
            </NavItem>
          </Nav>
          <Switch>
            <Route path="/create">
              <CreatePackagePage />
            </Route>
            <Route path="/gift">
              <MyGiftsPage />
            </Route>
            <Route path="/">
              <GetPackagesPage />
            </Route>
          </Switch>
        </HeaderWrapper>
      </Router>
    )
  }
}

export default Header
