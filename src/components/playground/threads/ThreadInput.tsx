import { Mutator, useMutation } from '@/context/swr'
import { CursorPageResponse, Files, Threads } from '@/types'
import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { FiPaperclip, FiPlayCircle } from 'react-icons/fi'

type Props = {
  addMessage: Mutator<Threads.MessageCreateParams, Threads.ThreadMessage>
}

function ThreadInput({ addMessage: apiAddMessage }: Props) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const { trigger } = useMutation<unknown, Files.FileObject>(
    '/files',
    undefined
  )

  const sendDisabled = !input && !files.length

  const addMessage = useCallback(() => {
    if (!input && !files.length) {
      return
    }
    let createdFiles: Promise<Files.FileObject[]> = Promise.resolve([])
    if (files.length) {
      createdFiles = Promise.all(
        files.map((file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('purpose', 'assistants')
          return trigger(formData)
        })
      )
    }
    return createdFiles
      .then((files) => {
        return apiAddMessage(
          {
            role: 'user',
            content: input,
            file_ids: files.map((file) => file.id),
          },
          {
            // @ts-ignore due to types discrepancy
            optimisticData(
              currentData: CursorPageResponse<Threads.ThreadMessage>
            ) {
              if (!currentData) {
                return
              }
              currentData.data[0].content
              return {
                ...currentData,
                data: [
                  {
                    role: 'user',
                    file_ids: files.map((file) => file.id),
                    content: [{ type: 'text', text: { value: input } }],
                  },
                  ...currentData.data,
                ],
              }
            },
          }
        )
      })
      .then((addedMessage) => {
        setInput('')
        setFiles([])
      })
      .catch((err) => {
        // TODO: handle error
        console.error(err)
      })
  }, [apiAddMessage, input, files, trigger])

  const onInputChange = useCallback(
    (e) => {
      setInput(e.target.value)
    },
    [setInput]
  )
  return (
    <div className="border-gray-3 -mx-2 space-y-2 rounded-lg border p-4 shadow-xl">
      <Input
        className="focus-visible:!border-none focus-visible:!shadow-none"
        placeholder="Enter your message...."
        border="none"
        value={input}
        onChange={onInputChange}
      ></Input>
      <ButtonGroup size="sm" className="flex space-x-2">
        <Button
          {...(sendDisabled
            ? {}
            : {
                colorScheme: 'green',
              })}
          leftIcon={<FiPlayCircle />}
          isDisabled={sendDisabled}
          onClick={addMessage}
        >
          Add and run
        </Button>
        <Button isDisabled={sendDisabled} onClick={addMessage}>
          Add
        </Button>
        <label>
          <IconButton
            icon={<FiPaperclip />}
            aria-label="Attach file"
            as="span"
          />
          <input
            type="file"
            onChange={(e) => {
              const fileList = e.target.files
              if (fileList) {
                const filesArray = Array.from(fileList)
                setFiles((prevFiles) => [...prevFiles, ...filesArray])
              }
            }}
            multiple
            style={{ display: 'none' }}
          />
        </label>
      </ButtonGroup>
      {files.length > 0 && (
        <div className="pt-2">
          <HStack spacing={2} className="flex-wrap">
            {files.map((file, id) => (
              <Tag
                size="sm"
                key={file.name + id}
                borderRadius="full"
                variant="outline"
                colorScheme="green"
              >
                <TagLabel>{file.name}</TagLabel>
                <TagCloseButton
                  onClick={() =>
                    setFiles((files) => files.filter((f) => f !== file))
                  }
                />
              </Tag>
            ))}
          </HStack>
        </div>
      )}
    </div>
  )
}

export default ThreadInput
