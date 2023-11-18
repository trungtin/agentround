import { Threads } from '@/types'
import { useMutation } from './swr'

export const useUpdateThread = (thread_id: string | undefined) => {
  return useMutation<Threads.ThreadUpdateParams, Threads.Thread>(
    thread_id ? `/threads/${thread_id}` : null
  )
}
