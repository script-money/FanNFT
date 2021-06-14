import styled from 'styled-components'
import Header from './app/Header'

const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`

function App() {
  return (
    <Wrapper>
      <Header />
    </Wrapper>
  )
}

export default App
