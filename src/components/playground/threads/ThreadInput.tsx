import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
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

import { useListAssistants, useUpdateThread } from '@/context/api'
import { FiCheck, FiPaperclip, FiPlayCircle } from 'react-icons/fi'
import SelectAssistant from './SelectAssistant'

import { usePluginContext } from '@/context/plugin'
import { useAddMessage } from '@/hooks/threads'
import { BasePlugin } from '@/plugins/base'
import { Mention, MentionsInput } from 'react-mentions'

const agentMentionPattern = /@\[([^\]]+)\]\(([^\)]+)\)/g
const commandPattern = /\/\[([^\]]+)\]\(([^\)]+)\)/g

/**
 * Extract mentions pattern from input
 * @param input the input string
 * @returns tuple of extracted raw input and mention ids
 */
function extractMentions(
  pattern: RegExp = agentMentionPattern
): (input: string) => [string, string[]] {
  return (input: string) => {
    if (!input) return [input, []]
    // mention format @[SuperWriter](asst_NXrnGY9ncK5BOah7HhYFf6sG)
    const mentions = input.match(pattern)
    if (!mentions) return [input, []]

    // input without mentions
    let plainInput = input.replace(pattern, '$1')
    const mentionIds = [
      ...new Set(
        mentions.map((m) => {
          const id = m.match(/\(([^)]+)\)/)?.[1]
          return id!
        })
      ),
    ]

    return [plainInput, mentionIds]
  }
}

/**
 * Extract message, mentions, and commands from input
 * @param input the input string
 * @returns the extracted message, mentions, and commands
 */
async function processMessage(
  input: string,
  pluginCommands: PluginCommand[],
  threadMessages: Threads.ThreadMessage[] | undefined
): Promise<{
  plainInput: string | undefined
  mentionIds: string[]
  commandIds: string[]
}> {
  // iterate through the patterns and extract mentions

  let [plainInput, [mentionIds, commandIds]] = [
    extractMentions(agentMentionPattern),
    extractMentions(commandPattern),
  ].reduce(
    (acc, fn) => {
      let [prevInput, prevIds] = acc
      if (!prevInput)
        return [prevInput, [...prevIds, []]] as [string, string[][]]
      const [plainInput, ids] = fn(prevInput)
      return [plainInput, [...prevIds, ids]] as [string, string[][]]
    },
    [input, []] as [string | undefined, string[][]]
  )

  for (const pluginCommand of pluginCommands) {
    if (!plainInput) break
    const { id, plugin } = pluginCommand

    if (commandIds.includes(id)) {
      const result = await plugin.handleMentionedMessage({
        message: plainInput,
        threadMessages: threadMessages || [],
      })
      plainInput = result.message
    }
  }
  return {
    plainInput,
    mentionIds,
    commandIds,
  }
}

type PluginCommand = {
  id: string
  name: string
  plugin: BasePlugin
}

type Command = PluginCommand

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

function TextareaWithMentions({
  portalRef,
  commands,
  ...rest
}: {
  portalRef: any
  commands: Command[]
  [key: string]: any
}) {
  const commandsMention = useMemo(() => {
    return commands?.map((c) => ({ id: c.id, display: c.name })) || []
  }, [commands])

  const { data: assistants } = useListAssistants({ revalidateOnMount: false })
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
        markup="@[__display__](__id__)"
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
      <Mention
        trigger="/"
        data={commandsMention}
        style={mentionStyle}
        markup="/[__display__](__id__)"
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
  thread: Threads.Thread | undefined
  tempAsst: Assistants.Assistant | null | undefined
  setTempAsst: (a: Assistants.Assistant | null | undefined) => void
}

function ThreadInput({ thread, tempAsst, setTempAsst }: Props) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const { trigger: runThread, isMutating: running } = useMutation<
    Threads.Runs.RunCreateParams | undefined,
    Threads.Runs.Run
  >(thread ? `/threads/${thread.id}/runs` : null)

  const sendDisabled = !thread || (!input && !files.length)

  const { installedPlugins } = usePluginContext()

  const { data: threadMessages } = useApi<
    CursorPageResponse<Threads.ThreadMessage>
  >(thread && `/threads/${thread.id}/messages`)

  const pluginCommands = useMemo(() => {
    return Object.values(installedPlugins).map(
      (p): PluginCommand => ({
        id: p.plugin_name,
        name: p.display_name,
        plugin: p,
      })
    )
  }, [installedPlugins])

  const apiAddMessage = useAddMessage({ thread })

  const rawAddMessage = useCallback(
    async (rawInput) => {
      let threadMessage: Threads.ThreadMessage | undefined
      if (rawInput) {
        threadMessage = await apiAddMessage(rawInput, files)
      }
      // some plugins may stop the message from being sent by returning undefined
      // and handle the message themselves so we can safely clear the input
      setInput('')
      setFiles([])
      return threadMessage
    },
    [apiAddMessage, files]
  )

  const addMessage = useCallback(async () => {
    const { plainInput } = await processMessage(
      input,
      pluginCommands,
      threadMessages?.data
    )
    rawAddMessage(plainInput)
  }, [rawAddMessage, input, pluginCommands, threadMessages?.data])

  const addAndRun = useCallback(async () => {
    if (!thread) return
    // have to extract first to determine if we need to open the assistant select
    const { plainInput, mentionIds } = await processMessage(
      input,
      pluginCommands,
      threadMessages?.data
    )

    // prefer the assistant that was mentioned
    let preferredAssistantId = mentionIds[0]
    if (!preferredAssistantId && plainInput) {
      preferredAssistantId = (thread.metadata as any)?.preferred_assistant_id

      if (!preferredAssistantId) {
        if (!tempAsst) {
          return setTempAsst(null)
        } else {
          preferredAssistantId = tempAsst.id
        }
      }
    }

    const threadMessage = await rawAddMessage(plainInput)
    if (!threadMessage) return
    runThread({
      assistant_id: preferredAssistantId,
    })
  }, [
    runThread,
    thread,
    threadMessages?.data,
    input,
    pluginCommands,
    rawAddMessage,
    tempAsst,
    setTempAsst,
  ])

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
      className="-mx-2 space-y-2 rounded-lg border bg-white p-4 shadow-xl transition-shadow duration-150 focus-within:border-gray-300 focus-within:shadow-md"
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
        commands={pluginCommands}
        // where to render the suggestions
        portalRef={threadInputRef}
        onFocus={() => {
          // hide the assistant select error when the input is focused
          if (tempAsst === null) setTempAsst(undefined)
        }}
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
