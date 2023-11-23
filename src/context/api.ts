import { Assistants, CursorPageResponse, Threads } from '@/types'
import { SWRConfiguration } from 'swr'
import { useApi, useMutation } from './swr'

export const useUpdateThread = (thread_id: string | undefined) => {
  return useMutation<Threads.ThreadUpdateParams, Threads.Thread>(
    thread_id ? `/threads/${thread_id}` : null
  )
}

// hook for getting the last run of a thread
export const useLastRun = (thread_id: string | undefined) => {
  const { data, ...rest } = useApi<CursorPageResponse<Threads.Runs.Run>>(
    thread_id ? `/threads/${thread_id}/runs` : null,
    undefined,
    {
      query: { limit: 1 },
    }
  )

  const lastRun = data?.data?.at(-1)

  return {
    data: lastRun,
    ...rest,
  }
}

export const useListAssistants = (
  config: SWRConfiguration | undefined = undefined
) => {
  return useApi<CursorPageResponse<Assistants.Assistant>>('/assistants', config)
}

export const useCreateAssistant = () => {
  return useMutation<Assistants.AssistantCreateParams, Assistants.Assistant>(
    '/assistants'
  )
}
