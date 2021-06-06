import styled from 'styled-components'

import Section from './components/Section'
import Header from './components/Header'

import GetPackages from './demo/GetPackages'
import GetGifts from './demo/GetGifts'
import Authenticate from './demo/Authenticate'
import UserInfo from './demo/UserInfo'
import SetUpAccount from './demo/SetUpAccount'
import CreatePackage from './demo/CreatePackage'

const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`

function App() {
  return (
    <Wrapper>
      <Section>
        <Header>FCL wallet interactions</Header>
        <Authenticate />
        <UserInfo />
        <SetUpAccount />
        <GetPackages />
        <GetGifts />
        <CreatePackage />
      </Section>
    </Wrapper>
  )
}

export default App
