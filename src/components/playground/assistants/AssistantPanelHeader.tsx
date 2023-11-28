import { useAssistantContext } from '@/context/AssistantContext'
import { useMutation } from '@/context/swr'
import { Assistants, Threads } from '@/types'
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { useCallback } from 'react'
import { FiFilePlus, FiMoreVertical, FiUsers, FiX } from 'react-icons/fi'

import { useStackedPageState } from '@/components/stacked/contexts'
import {
  PanelHeader,
  PanelHeaderActions,
  PanelHeaderTitle,
} from '../panel/PanelHeader'

function AssistantActions(props: {
  assistant: Assistants.Assistant | undefined
}) {
  const assistantCtx = useAssistantContext()
  const stackedPageState = useStackedPageState()
  const { trigger: addThread, isMutating: addingThread } = useMutation<
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
  const closePanel = useCallback(() => {
    // in case the thread is failed to load, we can still close it with the id from the context
    const assistantId = props.assistant?.id || stackedPageState.id
    assistantCtx.urls.removePanel(assistantId)
  }, [assistantCtx.urls, props.assistant, stackedPageState.id])
  // const { trigger: deleteAssistantApi, isMutating: deleting } = useMutation(
  //   props.assistant ? `/assistants/${props.assistant.id}` : null,
  //   undefined,
  //   { method: 'DELETE' }
  // )

  return (
    <PanelHeaderActions>
      <Menu isLazy>
        <MenuButton
          size={'sm'}
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical />}
          variant="outline"
          isLoading={addingThread}
        />
        <MenuList>
          <MenuItem icon={<FiFilePlus />} onClick={newThread}>
            New Thread
          </MenuItem>
          <MenuItem icon={<FiX />} onClick={closePanel}>
            Close Panel
          </MenuItem>
          {/* <MenuDivider />
          <MenuItem
            icon={<FiTrash2 />}
            onClick={deleteAssistant}
            isDisabled={!props.assistant}
          >
            Delete Agent
          </MenuItem> */}
        </MenuList>
      </Menu>
    </PanelHeaderActions>
  )
}

function AssistantPanelHeader({
  assistant,
  createMode,
}: {
  assistant: Assistants.Assistant | undefined
  createMode?: boolean
}) {
  return (
    <PanelHeader>
      <PanelHeaderTitle>
        <span className="mr-1">
          <FiUsers />
        </span>
        <span>
          {createMode
            ? 'Create Agent'
            : assistant?.name || assistant?.id || 'Assistant'}
        </span>
      </PanelHeaderTitle>
      <AssistantActions assistant={assistant}></AssistantActions>
    </PanelHeader>
  )
}

export default AssistantPanelHeader
