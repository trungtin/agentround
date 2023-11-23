import {
  BasePlugin,
  PluginContext as PluginContextType
} from '@/plugins/base'
import { noop } from '@/utils/utils'
import { createContext, useContext, useMemo } from 'react'
import { useAssistantContext } from './AssistantContext'
import { useCreateAssistant } from './api'
import { useDeferredMutate } from './swr'

const PluginContext = createContext<{
  installedPlugins: Record<string, BasePlugin>
}>(null as any)

export const PluginProvider = ({ children }) => {
  const assistantsContext = useAssistantContext()
  const { trigger: createAssistant } = useCreateAssistant()
  const { mutate } = useDeferredMutate()
  const pluginContext: PluginContextType = useMemo(() => {
    return {
      listAssistants: noop,
      createAssistant: (params) => createAssistant(params),
      updateAssistant: (id, params) => mutate('/assistants/' + id, params),
      deleteAssistant: noop,
      createThread: noop,
      createRun: noop,

      appendThread: assistantsContext.urls.appendThread,
      removeThread: assistantsContext.urls.removeThread,
    }
  }, [mutate, createAssistant, assistantsContext.urls])
  const installedPlugins = useMemo(() => {
    return Object.fromEntries(
      ([] as any[]).map((P) => {
        const plugin = new P(pluginContext)
        return [plugin.plugin_name, plugin]
      })
    )
  }, [pluginContext])

  const pluginContextValue = useMemo(() => {
    return {
      pluginContext,
      installedPlugins,
    }
  }, [pluginContext, installedPlugins])

  return (
    <PluginContext.Provider value={pluginContextValue}>
      {children}
    </PluginContext.Provider>
  )
}
export const usePluginContext = () => useContext(PluginContext)
