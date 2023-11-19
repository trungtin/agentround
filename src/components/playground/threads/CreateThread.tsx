import { useAssistant } from '@/context/AssistantContext'
import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { Button, ButtonGroup, IconButton, Select } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'
import SelectAssistant from './SelectAssistant'
import { useAuth } from '@/context/AuthProvider'

function CreateThread(props: {}) {
  const assistantCtx = useAssistant()
  const { token } = useAuth()
  const [showSelect, setShowSelect] = useState(false)

  const [selectedAssistant, setSelectedAssistant] =
    useState<Assistants.Assistant | null>(null)

  const { trigger: addThread, isMutating: creating } = useMutation<
    Threads.ThreadCreateParams | undefined,
    Threads.Thread
  >('/threads')

  const createThread = useCallback(() => {
    if (!selectedAssistant) {
      return
    }
    return addThread({
      metadata: { preferred_assistant_id: selectedAssistant.id },
    }).then((thread) => {
      assistantCtx.urls.appendThread(thread)
      setShowSelect(false)
    })
  }, [selectedAssistant, addThread, assistantCtx.urls])
  if (!token) {
    return null
  }
  return (
    <div>
      {showSelect ? (
        <ButtonGroup size="sm">
          <IconButton
            icon={<FiX />}
            aria-label="Close assistant selector"
            onClick={() => setShowSelect(false)}
          ></IconButton>
          <SelectAssistant onSelectAssistant={setSelectedAssistant} />

          <IconButton
            icon={<FiPlus />}
            aria-label="Create new thread"
            onClick={createThread}
            isDisabled={!selectedAssistant}
            isLoading={creating}
          ></IconButton>
        </ButtonGroup>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSelect(true)}
          isLoading={creating}
        >
          New thread
        </Button>
      )}
    </div>
  )
}

export default CreateThread
