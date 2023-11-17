import { Threads } from 'openai/resources/beta/threads/threads.mjs'
import ThreadMessage from './ThreadMessage'
import { useMemo } from 'react'

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
      {reversed?.map((message) => {
        return (
          <ThreadMessage message={message} key={message.id}></ThreadMessage>
        )
      })}
    </div>
  )
}

export default ThreadMessages
