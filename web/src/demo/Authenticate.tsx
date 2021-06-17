import React, { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import styled from 'styled-components'

interface SignInOutButtonProps {
  user: User
}

interface User {
  loggedIn: boolean | null
}

interface IUserContext {
  address: string
}

const initUserContext: IUserContext = {
  address: '',
}

const LoginButton = styled.button`
  margin: 10px;
  color: gray;
  background: transparent;
  border: 2px solid gray;
  border-radius: 16px;
  height: 50px;
  width: 100px;
  font-size: 16px;
  &:hover {
    background-color: RGB(245, 192, 237);
    color: white;
  }
`

export const SignInOutButton = (props: SignInOutButtonProps) => {
  const signInOrOut = async (event: any) => {
    event.preventDefault()

    if (props.user.loggedIn) {
      fcl.unauthenticate()
      localStorage.removeItem('userInitStatus')
    } else {
      fcl.authenticate()
    }
  }

  return (
    <>
      <LoginButton onClick={signInOrOut}>{props.user.loggedIn ? '注销' : '登录/注册'}</LoginButton>
    </>
  )
}

const CurrentUser = () => {
  const [user, setUser] = useState({ loggedIn: false })
  useEffect(
    () =>
      fcl.currentUser().subscribe((user: any) => {
        setUser({ ...user })
      }),
    []
  )

  return (
    <>
      <SignInOutButton user={user} />
    </>
  )
}

export default CurrentUser
