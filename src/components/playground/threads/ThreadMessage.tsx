import { useApi } from '@/context/swr'
import { Assistants, Threads } from '@/types'

type Props = {
  message: Threads.ThreadMessage
}

function MessageRole({ message }: { message: Props['message'] }) {
  const { data } = useApi<Assistants.Assistant>(
    message.assistant_id && `/assistants/${message.assistant_id}`
  )
  return (
    <div className="p-1 font-bold">
      {message.role === 'user' ? 'User' : data?.name || 'Assistant'}
    </div>
  )
}

function MessageContent({ message }: { message: Props['message'] }) {
  return (
    <div className="p-1">
      {message.content?.map((content, idx) => {
        content
        if (content.type == 'text') {
          // TODO: implement annotation
          return <div key={idx}>{content.text.value}</div>
        } else if (content.type == 'image_file') {
          // TODO: implement image
          return null
        } else {
          console.warn('Unknown content type', content)
          return null
        }
      })}
    </div>
  )
}

export default function ThreadMessage({ message }: Props) {
  return (
    <div>
      <div>
        {/* author */}
        <span>{<MessageRole message={message} />}</span>
      </div>
      <div>
        {/* content */}
        <span>{<MessageContent message={message} />}</span>
      </div>
      {/* TODO: render message.file_ids */}
    </div>
  )
}
