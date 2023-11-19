import { createContext, useContext, useMemo } from 'react'

const ThreadContext = createContext<{
  threadId: string
}>({
  threadId: '',
})

export function ThreadProvider({ children, threadId }) {
  const value = useMemo(() => ({ threadId }), [threadId])
  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  )
}

export const useThreadContext = () => useContext(ThreadContext)
