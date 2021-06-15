import { Component } from 'react'
import styled from 'styled-components'
import logoPic from '../assets/logo.png'
import Authenticate from '../app/Authenticate'
import { BrowserRouter as Router, NavLink, Switch, Route } from 'react-router-dom'
import CreatePackagePage from '../page/CreatePackagePage'
import MyGiftsPage from '../page/MyGiftsPage'
import GetPackagesPage from '../page/GetPackagesPage'

const HeaderWrapper = styled.div`
  padding: 0 10px;
  height: 100px;
  background: white;
  display: flex;
  justify-content: space-around;
`
const Logo = styled.a`
  display: flex;
  width: 100px;
  background: url(${logoPic});
  background-size: cover;
  padding-top: 10px;
`
const Nav = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: 1;
`

const NavItem = styled.div`
  margin-left: 20px;
  font-size: 17px;
  color: #333;
  justify-content: space-around;
`

const AuthenticateWrapper = styled.div`
  display: flex;
  width: 100px;
  align-items: center;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: RGB(245, 192, 237);
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }

  &.current {
    border-bottom: 2px solid black;
  }
`

class Header extends Component {
  render() {
    return (
      <Router>
        <HeaderWrapper>
          <Logo href="/" />
          <Nav>
            <NavItem>
              <StyledLink to="/" activeClassName="current" exact>
                首页
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/gift" activeClassName="current" exact>
                我的礼物
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/create" activeClassName="current" exact>
                创建礼包
              </StyledLink>
            </NavItem>
          </Nav>
          <AuthenticateWrapper>
            <Authenticate />
          </AuthenticateWrapper>
        </HeaderWrapper>
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
      </Router>
    )
  }
}

export default Header
