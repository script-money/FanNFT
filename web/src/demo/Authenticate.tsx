import React, { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

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

// TODO 修改SignInOutButton样式
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

  return <button onClick={signInOrOut}>{props.user.loggedIn ? '注销' : '登录/注册'}</button>
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
