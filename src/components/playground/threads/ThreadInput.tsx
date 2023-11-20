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
import { useCallback, useMemo, useRef, useState } from 'react'

import { useAssistants, useUpdateThread } from '@/context/api'
import { FiCheck, FiPaperclip, FiPlayCircle } from 'react-icons/fi'
import SelectAssistant from './SelectAssistant'

import { Mention, MentionsInput } from 'react-mentions'

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

const mentionsInputStyle = {
  input: { overflow: 'auto', outline: 'none' },
  // highlighter height indirectly controls the height of the input
  highlighter: { maxHeight: '15rem' },
  suggestions: {
    list: {
      borderRadius: 'var(--chakra-radii-md)',
      overflow: 'auto',
      maxHeight: '9rem',
      boxShadow: 'var(--chakra-shadows-md)',
    },
  },
}
// style of each mention
const mentionStyle = {
  backgroundColor: 'var(--chakra-colors-gray-200)',
  padding: '0 0.125rem',
  margin: '0 -0.175rem',
}

function TextareaWithMentions({ portalRef, ...rest }: any) {
  const { data: assistants } = useAssistants({ revalidateOnMount: false })
  const assistantsMention = useMemo(() => {
    return assistants?.data.map((a) => ({ id: a.id, display: a.name })) || []
  }, [assistants])
  return (
    <MentionsInput
      {...rest}
      style={mentionsInputStyle}
      suggestionsPortalHost={portalRef?.current}
      allowSuggestionsAboveCursor
    >
      <Mention
        trigger="@"
        data={assistantsMention}
        style={mentionStyle}
        renderSuggestion={(
          mention,
          query,
          highlightedDisplay,
          idx,
          focused
        ) => {
          return (
            <Button
              className={`w-full !justify-start rounded-none ${
                focused ? '!bg-gray-200' : '!bg-gray-100'
              }`}
              size="sm"
              rounded={0}
            >
              {mention.display}
            </Button>
          )
        }}
      />
    </MentionsInput>
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

  const sendDisabled = !thread || (!input && !files.length)

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
  const onKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && e.metaKey) {
        addAndRun()
      }
    },
    [addAndRun]
  )
  const threadInputRef = useRef<HTMLDivElement>(null)
  return (
    <div
      className="-mx-2 space-y-2 rounded-lg border p-4 shadow-xl focus-within:border-gray-300 focus-within:shadow-md"
      ref={threadInputRef}
    >
      <Textarea
        rows={1}
        as={TextareaWithMentions}
        minH="unset"
        resize="none"
        className="w-full overflow-hidden !p-0 focus-visible:!border-none focus-visible:!shadow-none"
        placeholder="Enter your message...."
        border="none"
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyPress}
        isDisabled={!thread}
        // where to render the suggestions
        portalRef={threadInputRef}
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
