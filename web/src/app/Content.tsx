import { ReactNode } from 'react'
import styled from 'styled-components'

interface ContentProps {
  title: string
  children?: ReactNode
}

const StyledMainContent = styled.div`
  border: 2px solid black;
`

const Content = (props: ContentProps) => {
  return (
    <>
      <title>{props.title}</title>
      <StyledMainContent>{props.children}</StyledMainContent>
    </>
  )
}

export default Content
