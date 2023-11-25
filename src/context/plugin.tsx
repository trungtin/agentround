import { useCreateAssistant, useCreateThread } from '@/hooks/plugin-api'
import { BasePlugin, PluginContext as PluginContextType } from '@/plugins/base'
import { Assistants, CursorPageResponse } from '@/types'
import { noop } from '@/utils/utils'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { useAssistantContext } from './AssistantContext'
import { useDeferredMutate, useDeferredQuery } from './swr'

const PluginContext = createContext<{
  installedPlugins: Record<string, BasePlugin>
}>(null as any)

export const PluginProvider = ({ children }) => {
  const assistantsContext = useAssistantContext()
  const { trigger: createAssistant } = useCreateAssistant()
  const { trigger: createThread } = useCreateThread()
  const { mutate } = useDeferredMutate()
  const { query } = useDeferredQuery()
  const pluginContext = useCallback(
    (Plugin: { new (ctx: PluginContextType): BasePlugin }) => {
      // only forward the args that are needed to prevent plugin access to the whole api
      // e.g. { createAssistant: (params) => createAssistant(params) } instead of { createAssistant }

      const context: PluginContextType = {
        listAssistants: async () => {
          const data = await query<CursorPageResponse<Assistants.Assistant>>(
            '/assistants'
          )

          return (
            data?.data.filter(
              (a) =>
                plugin.plugin_name &&
                (a.metadata as any)?.__ar_plugin === plugin.plugin_name
            ) || []
          )
        },
        createAssistant: (params) => {
          return createAssistant({
            ...params,
            metadata: {
              ...(params.metadata || {}),
              __ar_plugin: plugin.plugin_name,
            },
          })
        },
        updateAssistant: async (id, params) => {
          const assistants = await context.listAssistants()
          if (assistants?.find((a) => a.id === id)) {
            return mutate('/assistants/' + id, params)
          }
          throw new Error('Assistant not found')
        },
        deleteAssistant: async (id) => {
          const assistants = await context.listAssistants()
          if (assistants?.find((a) => a.id === id)) {
            mutate('/assistants/' + id, null, {
              method: 'DELETE',
            })
            return
          }
          throw new Error('Assistant not found')
        },
        createThread: (params) => {
          return createThread({
            ...params,
            metadata: {
              ...(params.metadata || {}),
              __ar_plugin: plugin.plugin_name,
            },
          })
        },
        createRun: noop,

        appendPanel: (thread) => assistantsContext.urls.appendPanel(thread),
        removePanel: (thread) => assistantsContext.urls.removePanel(thread),
      }
      const plugin = new Plugin(context)
      return plugin
    },
    [mutate, query, createAssistant, createThread, assistantsContext.urls]
  )
  const installedPlugins = useMemo(() => {
    return Object.fromEntries(
      [].map((P) => {
        const plugin = pluginContext(P)
        return [plugin.plugin_name, plugin]
      })
    )
  }, [pluginContext])

  const pluginContextValue = useMemo(() => {
    return {
      installedPlugins,
    }
  }, [installedPlugins])

  return (
    <PluginContext.Provider value={pluginContextValue}>
      {children}
    </PluginContext.Provider>
  )
}
export const usePluginContext = () => useContext(PluginContext)
