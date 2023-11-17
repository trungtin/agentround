import { useApi } from '@/context/swr'
import { CursorPageResponse, Threads } from '@/types'
import openai from 'openai'
import ThreadInput from './ThreadInput'
import ThreadMessages from './ThreadMessages'

openai.Beta.Threads

openai.Page

function Thread({ thread_id }: { thread_id: string }) {
  const { data: thread } = useApi<Threads.Thread>(`/api/threads/${thread_id}`)
  const { data: messages, mutate: postMessage } = useApi<
    CursorPageResponse<Threads.ThreadMessage>
  >(`/api/threads/${thread_id}/messages`)

  return (
    <div className="w-[540px] px-4 py-4">
      <div className="">
        <ThreadMessages messages={messages?.data}></ThreadMessages>
      </div>
      <ThreadInput />
    </div>
  )
}

export default Thread
