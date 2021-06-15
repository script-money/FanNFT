import { useState } from 'react'
import * as fcl from '@onflow/fcl'
import { useThrottleEffect } from 'ahooks'
import { SignInOutButton } from '../demo/Authenticate'

export type SessionUser = {
  addr: string | null
  cid?: string | null
  expiresAt?: string | null
  f_type?: 'USER' | 'User'
  f_vsn?: '1.0.0'
  loggedIn: boolean | null
  services?: []
}

const Authenticate = () => {
  const [user, setUser] = useState<SessionUser>({ loggedIn: false, addr: '' })

  useThrottleEffect(
    () => {
      fcl.currentUser().subscribe((user: SessionUser) => {
        if (user.loggedIn === null) {
          fcl.authenticate()
        } else {
          setUser({ ...user })
        }
      })
    },
    [user.addr],
    {
      wait: 1000,
    }
  )
  return (
    <>
      <SignInOutButton user={user}></SignInOutButton>
    </>
  )
}

export default Authenticate
