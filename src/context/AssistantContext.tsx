import { Threads } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { PropsWithChildren, useCallback } from 'react'

const noop = (() => {}) as any

const AssistantContext = React.createContext<{
  urls: {
    appendThread(thread: Threads.Thread): void
    removeThread(thread_id: string): void
  }
}>({
  urls: {
    appendThread: noop,
    removeThread: noop,
  },
})

function useAppendThread() {
  const router = useRouter()

  return useCallback(
    (thread: Threads.Thread) => {
      const searchParams = new URLSearchParams(document.location.search)
      const stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []
      stacked.push(thread.id)
      searchParams.set('stacked', stacked.join(','))
      router.push(`?${searchParams}`)
    },
    [router]
  )
}

function useRemoveThread() {
  const router = useRouter()

  return useCallback(
    (thread_id: string) => {
      const searchParams = new URLSearchParams(document.location.search)
      const stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []
      const filtered = stacked.filter((id) => id !== thread_id)
      if (filtered.length != stacked.length) {
        searchParams.set('stacked', filtered.join(','))
        router.push(`?${searchParams}`)
      }
    },
    [router]
  )
}

export function AssistantProvider(props: PropsWithChildren) {
  const appendThread = useAppendThread()
  const removeThread = useRemoveThread()
  const value = React.useMemo(
    () => ({
      urls: {
        appendThread,
        removeThread,
      },
    }),
    [appendThread, removeThread]
  )

  return <AssistantContext.Provider {...props} value={value} />
}

export const useAssistant = () => React.useContext(AssistantContext)
