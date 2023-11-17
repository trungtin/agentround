import { Threads } from 'openai/resources/beta/threads/threads.mjs'
import ThreadMessage from './ThreadMessage'

function ThreadMessages({
  messages,
}: {
  messages: Threads.ThreadMessage[] | undefined
}) {
  return (
    <div>
      {messages?.map((message) => {
        return (
          <ThreadMessage message={message} key={message.id}></ThreadMessage>
        )
      })}
    </div>
  )
}

export default ThreadMessages
