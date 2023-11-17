import { useApi, useMutation } from '@/context/swr'
import { CursorPageResponse, Threads } from '@/types'
import { memo } from 'react'
import ThreadInput from './ThreadInput'
import ThreadMessages from './ThreadMessages'

function Thread({ thread_id }: { thread_id: string }) {
  const { data: thread } = useApi<Threads.Thread>(`/api/threads/${thread_id}`)
  const messagesPath = `/api/threads/${thread_id}/messages`
  const { data: messages } =
    useApi<CursorPageResponse<Threads.ThreadMessage>>(messagesPath)
  const { trigger: addMessage } = useMutation<
    Threads.MessageCreateParams,
    Threads.ThreadMessage
  >(messagesPath)

  return (
    <div className="flex h-full w-[540px] flex-col justify-between py-4">
      <div className="pb-4">
        <ThreadMessages messages={messages?.data}></ThreadMessages>
      </div>
      <div className="sticky bottom-4 bg-white">
        <ThreadInput addMessage={addMessage} />
      </div>
    </div>
  )
}

export default memo(Thread)
