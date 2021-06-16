import React, { createContext, useContext, useReducer } from 'react'
import styled from 'styled-components'
import logoPic from '../assets/logo.png'
import { BrowserRouter as Router, NavLink, Switch, Route } from 'react-router-dom'
import GetPackagesPage from '../page/GetPackagesPage'
import CreatePackagePageV2 from '../page/CreatePackagePageV2'
import { SignInOutButton } from '../demo/Authenticate'
import { SessionUserContext } from '../app/Authenticate'
import GetPackages from '../demo/GetPackages'
import SetUpAccount from '../demo/SetUpAccount'
import GetGifts from '../demo/GetGifts'
import { IPackageInfo } from '../interfaces'
import MyGiftsPage from '../page/MyGiftsPage'

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

const initialState: State = {
  data: [],
}

export const PackageInfoContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
}>({
  state: initialState,
  dispatch: () => undefined,
})

type Action = { type: 'UPDATE'; result: IPackageInfo[] }
type State = { data?: IPackageInfo[] }

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE':
      return {
        data: action.result,
      }
    default:
      return initialState
  }
}

const Header = () => {
  const sessionUser = useContext(SessionUserContext)
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <Router>
      <PackageInfoContext.Provider value={{ state, dispatch }}>
        <HeaderWrapper>
          <Logo href="/" />
          <Nav>
            <NavItem>
              <StyledLink to="/" activeClassName="current" exact>
                首页
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/packages" activeClassName="current" exact>
                获取礼包(old)
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/gift-old" activeClassName="current" exact>
                我的礼物(old)
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/gift" activeClassName="current" exact>
                我的礼物
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/setup" activeClassName="current" exact>
                设置账户(old)
              </StyledLink>
            </NavItem>
            <NavItem>
              <StyledLink to="/create" activeClassName="current" exact>
                创建礼包
              </StyledLink>
            </NavItem>
            <NavItem>
              <SignInOutButton user={sessionUser}></SignInOutButton>
            </NavItem>
          </Nav>
        </HeaderWrapper>
        <Switch>
          <Route path="/create">
            <CreatePackagePageV2 />
          </Route>
          <Route path="/packages">
            <GetPackages />
          </Route>
          <Route path="/gift-old">
            <GetGifts />
          </Route>
          <Route path="/gift">
            <MyGiftsPage />
          </Route>
          <Route path="/setup">
            <SetUpAccount />
          </Route>
          <Route path="/">
            <GetPackagesPage />
          </Route>
        </Switch>
      </PackageInfoContext.Provider>
    </Router>
  )
}

export default Header
