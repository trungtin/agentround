import { createContext, useContext } from 'react'

const ThreadContext = createContext<{}>({})

export function ThreadProvider(props) {
  return <ThreadContext.Provider value={{}} {...props} />
}

export const useThreadContext = () => useContext(ThreadContext)
