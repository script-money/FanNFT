import styled from 'styled-components'
import Header from './app/Header'
import Authenticate from './app/Authenticate'
const FontWrapper = styled.div`
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Microsoft YaHei, Source Han Sans SC,
    Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif;
`

function App() {
  return (
    <FontWrapper>
      <Authenticate />
    </FontWrapper>
  )
}

export default App
