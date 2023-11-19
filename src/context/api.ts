import { CursorPageResponse, Threads } from '@/types'
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
