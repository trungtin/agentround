import { useAssistantContext } from '@/context/AssistantContext'
import { useAuth } from '@/context/AuthProvider'
import { useMutation } from '@/context/swr'
import { Threads } from '@/types'
import { NEW_ASST_ID } from '@/utils/constants'
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { useCallback } from 'react'
import { FiClipboard, FiPlus, FiUsers } from 'react-icons/fi'

function CreateMenu(props: {}) {
  const assistantCtx = useAssistantContext()
  const { token } = useAuth()

  const { trigger: addThread, isMutating: addingThread } = useMutation<
    Threads.ThreadCreateParams | undefined,
    Threads.Thread
  >('/threads')

  const createThread = useCallback(() => {
    return addThread({}).then((thread) => {
      assistantCtx.urls.appendPanel(thread)
    })
  }, [addThread, assistantCtx.urls])
  const createAssistant = useCallback(() => {
    return assistantCtx.urls.appendPanel(NEW_ASST_ID)
  }, [assistantCtx.urls])

  return (
    <div>
      <Menu isLazy>
        <MenuButton
          size={'sm'}
          as={IconButton}
          aria-label="Options"
          icon={<FiPlus />}
          variant="outline"
          isLoading={addingThread}
        />
        <MenuList>
          <MenuItem icon={<FiClipboard />} onClick={createThread}>
            New Thread
          </MenuItem>
          <MenuItem icon={<FiUsers />} onClick={createAssistant}>
            New Assistant
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  )
}

export default CreateMenu
