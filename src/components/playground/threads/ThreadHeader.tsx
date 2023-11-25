import { useAssistantContext } from '@/context/AssistantContext'
import { useLastRun } from '@/context/api'
import { useMutation } from '@/context/swr'
import { Assistants, Threads } from '@/types'
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { useCallback } from 'react'
import {
  FiFilePlus,
  FiMoreVertical,
  FiPlayCircle,
  FiTrash2,
  FiClipboard,
  FiX,
} from 'react-icons/fi'
import { waitingRunStatuses } from './runs'
import { useStackedPages } from '@/components/stacked/hooks'
import { Link } from '@chakra-ui/react'
import {
  PanelHeader,
  PanelHeaderActions,
  PanelHeaderTitle,
} from '../panel/PanelHeader'
import { useStackedPageState } from '@/components/stacked/contexts'

function ThreadActionsRun({
  thread,
  assistant,
}: {
  thread: Threads.Thread | undefined
  assistant: Assistants.Assistant | undefined
}) {
  const { data: lastRun } = useLastRun(thread?.id)

  const { trigger: runThread, isMutating: running } = useMutation<
    Threads.Runs.RunCreateParams | undefined,
    Threads.Runs.Run
  >(thread ? `/threads/${thread.id}/runs` : null)

  const run = useCallback(() => {
    if (!thread || !assistant) return
    runThread({
      assistant_id: assistant.id,
    })
  }, [thread, runThread, assistant])

  return (
    <Button
      size="sm"
      onClick={run}
      isLoading={running || waitingRunStatuses.includes(lastRun?.status!)}
      isDisabled={!thread}
    >
      <FiPlayCircle />
      <span className="ml-2">Run</span>
    </Button>
  )
}

function ThreadActions(props: {
  assistant: Assistants.Assistant | undefined
  thread: Threads.Thread | undefined
}) {
  const assistantCtx = useAssistantContext()
  const stackedPageState = useStackedPageState()
  const { trigger: addThread, isMutating: creating } = useMutation<
    Threads.ThreadCreateParams | undefined,
    Threads.Thread
  >('/threads')
  const newThread = useCallback(() => {
    addThread({
      metadata: { preferred_assistant_id: props.assistant?.id },
    }).then((thread) => {
      assistantCtx.urls.appendPanel(thread)
    })
  }, [props.assistant, addThread, assistantCtx.urls])
  const { trigger: deleteThreadApi, isMutating: deleting } = useMutation(
    props.thread ? `/threads/${props.thread.id}` : null,
    undefined,
    { method: 'DELETE' }
  )
  /**
   * Close the thread by removing it from the URL
   */
  const closeThread = useCallback(() => {
    // in case the thread is failed to load, we can still close it with the id from the context
    const threadId = props.thread?.id || stackedPageState.id
    assistantCtx.urls.removePanel(threadId)
  }, [assistantCtx.urls, props.thread, stackedPageState.id])
  /**
   * Delete the thread from the API then close it
   */
  const deleteThread = useCallback(() => {
    if (!props.thread) return
    deleteThreadApi().then(closeThread)
  }, [deleteThreadApi, closeThread, props.thread])
  return (
    <PanelHeaderActions>
      <ThreadActionsRun thread={props.thread} assistant={props.assistant} />
      <Menu isLazy>
        <MenuButton
          size={'sm'}
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<FiFilePlus />} onClick={newThread}>
            New Thread
          </MenuItem>
          <MenuItem icon={<FiX />} onClick={closeThread}>
            Close Thread
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<FiTrash2 />}
            onClick={deleteThread}
            isDisabled={!props.thread}
          >
            Delete Thread
          </MenuItem>
        </MenuList>
      </Menu>
    </PanelHeaderActions>
  )
}

function ThreadHeader(props: {
  assistant: Assistants.Assistant | undefined
  thread: Threads.Thread | undefined
}) {
  const [_, __, nav] = useStackedPages()
  return (
    <PanelHeader>
      <PanelHeaderTitle>
        <span className="mr-1">
          <FiClipboard />
        </span>
        {props.assistant ? (
          <Link
            onClick={() => {
              nav(props.assistant!.id)
            }}
          >
            {props.assistant.name || props.assistant.id}
          </Link>
        ) : (
          <span>Thread</span>
        )}
      </PanelHeaderTitle>
      <ThreadActions
        assistant={props.assistant}
        thread={props.thread}
      ></ThreadActions>
    </PanelHeader>
  )
}

export default ThreadHeader
