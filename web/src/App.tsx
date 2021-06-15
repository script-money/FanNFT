import styled from 'styled-components'
import Header from './app/Header'
import Authenticate from './app/Authenticate'
const FontWrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`

function App() {
  return (
    <FontWrapper>
      <Authenticate />
    </FontWrapper>
  )
}

export default App
