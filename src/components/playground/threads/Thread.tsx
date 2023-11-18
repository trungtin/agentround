import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { memo } from 'react'
import ThreadHeader from './ThreadHeader'
import ThreadInput from './ThreadInput'
import ThreadMessages from './ThreadMessages'

function Thread({ thread_id }: { thread_id: string }) {
  const { data: thread } = useApi<Threads.Thread>(`/api/threads/${thread_id}`)
  thread?.id
  // @ts-ignore
  const preferredAssistantId = thread?.metadata?.preferred_assistant_id
  const { data: preferredAssistant } = useApi<Assistants.Assistant>(
    preferredAssistantId ? `/api/assistants/${preferredAssistantId}` : null
  )

  const messagesPath = `/api/threads/${thread_id}/messages`
  const { data: messages } =
    useApi<CursorPageResponse<Threads.ThreadMessage>>(messagesPath)
  const { trigger: addMessage } = useMutation<
    Threads.MessageCreateParams,
    Threads.ThreadMessage
  >(messagesPath)

  return (
    <div className="flex w-[540px] grow flex-col py-4">
      <div>
        <ThreadHeader assistant={preferredAssistant}></ThreadHeader>
      </div>
      <div className="flex grow flex-col justify-between">
        <div className="pb-4">
          <ThreadMessages messages={messages?.data}></ThreadMessages>
        </div>
        <div className="sticky bottom-4 bg-white">
          <ThreadInput addMessage={addMessage} />
        </div>
      </div>
    </div>
  )
}

export default memo(Thread)
