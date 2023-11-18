import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { Button, ButtonGroup, IconButton, Select } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { FiXCircle, FiX, FiPlus } from 'react-icons/fi'

function CreateThread(props: {}) {
  const [showSelect, setShowSelect] = useState(false)
  const [selectedAssistant, setSelectedAssistant] =
    useState<Assistants.Assistant | null>(null)
  const { data: assistants } = useApi<CursorPageResponse<Assistants.Assistant>>(
    showSelect ? '/assistants' : null
  )
  const router = useRouter()
  const searchParams = new URLSearchParams(useSearchParams())
  const { trigger: addThread } = useMutation<
    Threads.ThreadCreateParams | undefined,
    Threads.Thread
  >('/threads')

  const createThread = useCallback(() => {
    if (!selectedAssistant) {
      return
    }
    return addThread().then((thread) => {
      const stacked =
        searchParams.getAll('stacked')?.join(',').split(',').filter(Boolean) ||
        []
      stacked.push(thread.id)
      searchParams.set('stacked', stacked.join(','))
      router.replace(`?${searchParams}`)
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
