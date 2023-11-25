import { Assistants, Threads } from '@/types'
import { useRouter } from 'next/navigation'
import React, { PropsWithChildren, useCallback } from 'react'

const noop = (() => {}) as any

const AssistantContext = React.createContext<{
  urls: {
    appendPanel(thread: Threads.Thread | Assistants.Assistant | string): void
    removePanel(thread_id: string): void
  }
}>({
  urls: {
    appendPanel: noop,
    removePanel: noop,
  },
})

function useAppendPanel() {
  const router = useRouter()

  return useCallback(
    (thread: Threads.Thread | string) => {
      const searchParams = new URLSearchParams(document.location.search)
      const stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []
      if (typeof thread === 'string') {
        stacked.push(thread)
      } else {
        stacked.push(thread.id)
      }
      searchParams.set('stacked', stacked.join(','))
      router.push(`?${searchParams}`)
    },
    [router]
  )
}

function useRemovePanel() {
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
  const appendPanel = useAppendPanel()
  const removePanel = useRemovePanel()
  const value = React.useMemo(
    () => ({
      urls: {
        appendPanel,
        removePanel,
      },
    }),
    [appendPanel, removePanel]
  )

  return <AssistantContext.Provider {...props} value={value} />
}

export const useAssistantContext = () => React.useContext(AssistantContext)
