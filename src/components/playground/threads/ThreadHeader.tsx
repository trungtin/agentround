import { useAssistant } from '@/context/AssistantContext'
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
  FiX,
} from 'react-icons/fi'

function ThreadTitle(props: { assistant: Assistants.Assistant | undefined }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase">
        {props.assistant?.name || 'Thread'}
      </span>
    </div>
  )
}

function ThreadActionsRun({
  thread,
  assistant,
}: {
  thread: Threads.Thread | undefined
  assistant: Assistants.Assistant | undefined
}) {
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
    <Button size="sm" onClick={run} isLoading={running}>
      <FiPlayCircle />
      <span className="ml-2">Run</span>
    </Button>
  )
}

function ThreadActions(props: {
  assistant: Assistants.Assistant | undefined
  thread: Threads.Thread | undefined
}) {
  const assistantCtx = useAssistant()
  const { trigger: addThread, isMutating: creating } = useMutation<
    Threads.ThreadCreateParams | undefined,
    Threads.Thread
  >('/threads')
  const newThread = useCallback(() => {
    addThread({
      metadata: { preferred_assistant_id: props.assistant?.id },
    }).then((thread) => {
      assistantCtx.urls.appendThread(thread)
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
    if (!props.thread) return
    assistantCtx.urls.removeThread(props.thread.id)
    return
  }, [assistantCtx.urls, props.thread])
  /**
   * Delete the thread from the API then close it
   */
  const deleteThread = useCallback(() => {
    if (!props.thread) return
    deleteThreadApi().then(closeThread)
  }, [deleteThreadApi, closeThread, props.thread])
  return (
    <div className="flex space-x-4">
      <ThreadActionsRun thread={props.thread} assistant={props.assistant} />
      <Menu isLazy colorScheme="red">
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
          <MenuItem icon={<FiTrash2 />} onClick={deleteThread}>
            Delete Thread
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  )
}

function ThreadHeader(props: {
  assistant: Assistants.Assistant | undefined
  thread: Threads.Thread | undefined
}) {
  return (
    <div className="sticky top-0 border-b border-gray-100 bg-white pb-2 pt-4">
      <div className="flex flex-row justify-between">
        <ThreadTitle assistant={props.assistant}></ThreadTitle>
        <ThreadActions
          assistant={props.assistant}
          thread={props.thread}
        ></ThreadActions>
      </div>
    </div>
  )
}

export default ThreadHeader
