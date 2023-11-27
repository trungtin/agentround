import { useApi } from '@/context/swr'
import { Assistants, CursorPageResponse } from '@/types'
import { Select } from '@chakra-ui/react'

function SelectAssistant({
  onSelectAssistant,
  placeholder,
  isInvalid = false,
}: {
  onSelectAssistant: (assistant: Assistants.Assistant | null) => void
  placeholder?: string
  isInvalid?: boolean
}) {
  const { data: assistants, isLoading } =
    useApi<CursorPageResponse<Assistants.Assistant>>('/assistants')
  return (
    <Select
      placeholder={
        isLoading
          ? 'Loading assistants...'
          : placeholder || 'Select an assistant'
      }
      size="sm"
      className="min-w-8 !rounded-md"
      onChange={(e) => {
        const assistant = assistants?.data.find(
          (assistant) => assistant.id === e.target.value
        )
        onSelectAssistant(assistant || null)
      }}
      isRequired
      isInvalid={isInvalid}
    >
      {assistants?.data.map((assistant) => (
        <option key={assistant.id} value={assistant.id}>
          {assistant.name}
        </option>
      ))}
    </Select>
  )
}

export default SelectAssistant
