import { useApi } from '@/context/swr'
import { Assistants, Files, Threads } from '@/types'
import { HStack, Tag, TagLabel } from '@chakra-ui/react'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  message: Threads.ThreadMessage
}

function MessageAuthor({ message }: { message: Props['message'] }) {
  const { data } = useApi<Assistants.Assistant>(
    message.assistant_id && `/assistants/${message.assistant_id}`
  )
  return (
    <div className="text-sm font-bold">
      {message.role === 'user' ? 'User' : data?.name || 'Assistant'}:
    </div>
  )
}

function MessageContent({ message }: { message: Props['message'] }) {
  return (
    <div className="">
      {message.content?.map((content, idx) => {
        if (content.type == 'text') {
          // TODO: implement annotation from openai response
          return (
            <div key={idx}>
              <Markdown
                className="markdown-content"
                remarkPlugins={[remarkGfm]}
              >
                {content.text.value}
              </Markdown>
            </div>
          )
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

function MessageFile({ file_id }: { file_id: string }) {
  const { data: file } = useApi<Files.FileObject>(`/files/${file_id}`)
  if (!file) {
    return null
  }
  return (
    <Tag size="sm" borderRadius="full" variant="outline" colorScheme="green">
      <TagLabel>{file.filename}</TagLabel>
    </Tag>
  )
}

function MessageFiles({ file_ids }: { file_ids: string[] }) {
  return (
    <HStack spacing={2} className="flex-wrap py-2">
      {file_ids.map((file_id) => (
        <MessageFile file_id={file_id} key={file_id}></MessageFile>
      ))}
    </HStack>
  )
}

export default function ThreadMessage({ message }: Props) {
  return (
    <div className="mb-1 py-3">
      <div className="mb-2">
        <span>{<MessageAuthor message={message} />}</span>
      </div>
      <div>
        <span>{<MessageContent message={message} />}</span>
      </div>
      <div>
        {message.file_ids?.length > 0 && (
          <MessageFiles file_ids={message.file_ids}></MessageFiles>
        )}
      </div>
    </div>
  )
}
