import { useState, useEffect } from 'react'

function useLocalJSONStore(key: string, defaultValue: any) {
  const [state, setState] = useState(() => JSON.parse(localStorage.getItem(key)!) || defaultValue)
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
    console.log(`setItem ${key} ${JSON.stringify(state)}`)
  }, [key, state])
  return [state, setState]
}

export default useLocalJSONStore
