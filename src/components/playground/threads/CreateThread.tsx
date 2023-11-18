import { useAssistant } from '@/context/AssistantContext'
import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { Button, ButtonGroup, IconButton, Select } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'

function CreateThread(props: {}) {
  const assistantCtx = useAssistant()
  const [showSelect, setShowSelect] = useState(false)
  const [selectedAssistant, setSelectedAssistant] =
    useState<Assistants.Assistant | null>(null)
  const { data: assistants } = useApi<CursorPageResponse<Assistants.Assistant>>(
    showSelect ? '/assistants' : null
  )
  const router = useRouter()
  const searchParams = new URLSearchParams(useSearchParams())
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
  }, [selectedAssistant])
  return (
    <div>
      {showSelect ? (
        <ButtonGroup size="sm">
          <IconButton
            icon={<FiX />}
            aria-label="Close assistant selector"
            onClick={() => setShowSelect(false)}
          ></IconButton>
          <Select
            placeholder="Select an assistant"
            size="sm"
            className="min-w-8"
            onChange={(e) => {
              const assistant = assistants?.data.find(
                (assistant) => assistant.id === e.target.value
              )
              setSelectedAssistant(assistant || null)
            }}
          >
            {assistants?.data.map((assistant) => (
              <option key={assistant.id} value={assistant.id}>
                {assistant.name}
              </option>
            ))}
          </Select>
          <IconButton
            icon={<FiPlus />}
            aria-label="Create new thread"
            onClick={createThread}
            isDisabled={!selectedAssistant}
            isLoading={creating}
          ></IconButton>
        </ButtonGroup>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowSelect(true)}>
          New thread
        </Button>
      )}
    </div>
  )
}

export default CreateThread
