import { Assistants, Threads } from '@/types'
import { useRouter } from 'next/navigation'
import React, { PropsWithChildren, useCallback } from 'react'

const noop = (() => {}) as any

const AssistantContext = React.createContext<{
  urls: {
    appendPanel(
      panel: Threads.Thread | Assistants.Assistant | string,
      replace?: string
    ): void
    removePanel(panel_id: string): void
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
    (
      panel: Threads.Thread | Assistants.Assistant | string,
      replace?: string
    ) => {
      const searchParams = new URLSearchParams(document.location.search)
      let stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []

      const panel_id = typeof panel === 'string' ? panel : panel.id
      if (
        replace !== undefined &&
        replace !== panel_id &&
        stacked.includes(replace)
      ) {
        stacked = stacked.map((id) => (id === replace ? panel_id : id))
      } else {
        stacked.push(panel_id)
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
    (panel_id: string) => {
      const searchParams = new URLSearchParams(document.location.search)
      const stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []
      const filtered = stacked.filter((id) => id !== panel_id)
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
