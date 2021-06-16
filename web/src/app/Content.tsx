import { ReactNode } from 'react'
import styled from 'styled-components'

interface ContentProps {
  title: string
  children?: ReactNode
}

const StyledMainContent = styled.div`
  border: 2px solid black;
`

const ContentWrapper = styled.div`
  min-width: 640px;
  border: 2px solid black;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`

const Title = styled.div`
  border: 2px solid black;
`

const Content = (props: ContentProps) => {
  return (
    <ContentWrapper>
      <Title>{props.title}</Title>
      <StyledMainContent>{props.children}</StyledMainContent>
    </ContentWrapper>
  )
}

export default Content
