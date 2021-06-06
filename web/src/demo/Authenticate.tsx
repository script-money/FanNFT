import React, { useState, useEffect, FC, createContext } from 'react'
import * as fcl from '@onflow/fcl'

import Card from '../components/Card'

interface SignInOutButtonProps {
  user: User
}

interface User {
  loggedIn: boolean
}

interface IUserContext {
  address: string
}

const initUserContext: IUserContext = {
  address: '',
}

export const userContext = createContext(initUserContext)

const SignInOutButton: FC<SignInOutButtonProps> = ({ user: { loggedIn } }) => {
  const signInOrOut = async (event: any) => {
    event.preventDefault()

    if (loggedIn) {
      fcl.unauthenticate()
    } else {
      fcl.authenticate()
    }
  }

  return <button onClick={signInOrOut}>{loggedIn ? 'Sign Out' : 'Sign In/Up'}</button>
}

const CurrentUser = () => {
  const [user, setUser] = useState({ loggedIn: false })
  const context = React.useContext(userContext)

  useEffect(
    () =>
      fcl.currentUser().subscribe((user: any) => {
        setUser({ ...user })
        context.address = user.addr as string
      }),
    []
  )

  return (
    <Card>
      <SignInOutButton user={user} />
    </Card>
  )
}

export default CurrentUser
