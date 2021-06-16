import { useState, useEffect, createContext } from 'react'
import * as fcl from '@onflow/fcl'
import Header from './Header'
import SetupAccount from './SetupAccount'

export type SessionUser = {
  addr: string | null
  cid?: string | null
  expiresAt?: string | null
  f_type?: 'USER' | 'User'
  f_vsn?: '1.0.0'
  loggedIn: boolean | null
  services?: []
}

export const SessionUserDefault = { loggedIn: false, addr: '' }

export const SessionUserContext = createContext<SessionUser>(SessionUserDefault)

const Authenticate = () => {
  const [user, setUser] = useState<SessionUser>(SessionUserDefault)

  useEffect(() => {
    fcl.currentUser().subscribe((user: SessionUser) => {
      if (user.loggedIn === null) {
        fcl.authenticate()
      } else {
        setUser({ ...user })
      }
    })
  }, [user.addr])
  return (
    <SessionUserContext.Provider value={user}>
      <Header />
      <SetupAccount />
    </SessionUserContext.Provider>
  )
}

export default Authenticate
