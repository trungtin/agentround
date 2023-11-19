import { Threads } from '@/types'
import ThreadMessage from './ThreadMessage'
import { useMemo } from 'react'

function EmptyThreadMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-4">
      <div className="text-gray-400">
        Send a message to get the conversation started
      </div>
    </div>
  )
}

function ThreadMessages({
  messages,
}: {
  messages: Threads.ThreadMessage[] | undefined
}) {
  const reversed = useMemo(() => {
    return [...(messages || [])].reverse()
  }, [messages])

  return (
    <div>
      {reversed?.length === 0 && <EmptyThreadMessages />}
      {reversed?.map((message) => {
        return (
          <ThreadMessage message={message} key={message.id}></ThreadMessage>
        )
      })}
    </div>
  )
}

export default ThreadMessages
