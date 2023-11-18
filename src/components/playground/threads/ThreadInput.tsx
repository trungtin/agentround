import { Mutator, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Files, Threads } from '@/types'
import {
  Button,
  ButtonGroup,
  FocusLock,
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { useUpdateThread } from '@/context/api'
import { FiCheck, FiPaperclip, FiPlayCircle } from 'react-icons/fi'
import SelectAssistant from './SelectAssistant'

import ResizeTextarea from 'react-textarea-autosize'

function UpdateAssistantPopover({
  open,
  onUpdated,
  thread,
}: {
  open: boolean
  onUpdated: () => void
  thread: Threads.Thread | undefined
}) {
  const [selectedAssistant, setSelectedAssistant] =
    useState<Assistants.Assistant | null>(null)

  const { trigger: updateThreadApi, isMutating: updating } = useUpdateThread(
    thread?.id
  )
  return (
    <Popover isOpen={open} placement="top-start" closeOnBlur={false}>
      <PopoverContent p={5}>
        <FocusLock persistentFocus={false}>
          <div className="mb-2 text-sm font-medium text-gray-900">
            Assign assistant to thread
          </div>

          <ButtonGroup size="sm">
            <SelectAssistant onSelectAssistant={setSelectedAssistant} />
            <IconButton
              icon={<FiCheck />}
              aria-label="Create new thread"
              onClick={() => {
                if (selectedAssistant) {
                  updateThreadApi({
                    metadata: {
                      preferred_assistant_id: selectedAssistant.id,
                    },
                  }).then(() => {
                    onUpdated()
                  })
                }
              }}
              isDisabled={!selectedAssistant}
              isLoading={updating}
            ></IconButton>
          </ButtonGroup>
        </FocusLock>
      </PopoverContent>
    </Popover>
  )
}

type Props = {
  addMessage: Mutator<Threads.MessageCreateParams, Threads.ThreadMessage>
  thread: Threads.Thread | undefined
}

function ThreadInput({ addMessage: apiAddMessage, thread }: Props) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const { trigger: addFiles } = useMutation<unknown, Files.FileObject>(
    '/files',
    undefined
  )
  const { trigger: runThread, isMutating: running } = useMutation<
    Threads.Runs.RunCreateParams | undefined,
    Threads.Runs.Run
  >(thread ? `/threads/${thread.id}/runs` : null)

  const [asstSelectOpen, setAsstSelectOpen] = useState(false)

  const sendDisabled = !input && !files.length

  const addMessage = useCallback(() => {
    if (!input && !files.length) {
      return Promise.resolve()
    }
    let createdFiles: Promise<Files.FileObject[]> = Promise.resolve([])
    if (files.length) {
      createdFiles = Promise.all(
        files.map((file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('purpose', 'assistants')
          return addFiles(formData)
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
              return {
                ...currentData,
                data: [
                  {
                    id: 'optimistic',
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
  }, [apiAddMessage, input, files, addFiles])

  const addAndRun = useCallback(() => {
    if (!thread) return
    const preferredAssistantId = (thread.metadata as any)
      ?.preferred_assistant_id

    if (!preferredAssistantId) return setAsstSelectOpen(true)

    addMessage().then(() => {
      runThread({
        assistant_id: preferredAssistantId,
      })
    })
  }, [addMessage, runThread, thread])

  const onInputChange = useCallback(
    (e) => {
      setInput(e.target.value)
    },
    [setInput]
  )
  return (
    <div className="border-gray-3 -mx-2 space-y-2 rounded-lg border p-4 shadow-xl">
      <Textarea
        minRows={1}
        as={ResizeTextarea}
        minH="unset"
        overflow="hidden"
        w="100%"
        resize="none"
        className="focus-visible:!border-none focus-visible:!shadow-none"
        placeholder="Enter your message...."
        border="none"
        value={input}
        onChange={onInputChange}
      ></Textarea>
      <ButtonGroup size="sm" className="flex space-x-2">
        <Button
          {...(sendDisabled
            ? {}
            : {
                colorScheme: 'green',
              })}
          leftIcon={<FiPlayCircle />}
          isDisabled={sendDisabled}
          isLoading={running}
          onClick={addAndRun}
        >
          Add and run
        </Button>
        <UpdateAssistantPopover
          open={asstSelectOpen}
          thread={thread}
          onUpdated={() => {
            setAsstSelectOpen(false)
          }}
        />
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
