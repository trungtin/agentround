import { useApi } from '@/context/swr'
import { Assistants, CursorPageResponse } from '@/types'
import { Select } from '@chakra-ui/react'

function SelectAssistant({
  onSelectAssistant,
}: {
  onSelectAssistant: (assistant: Assistants.Assistant | null) => void
}) {
  const { data: assistants } =
    useApi<CursorPageResponse<Assistants.Assistant>>('/assistants')
  return (
    <Select
      placeholder="Select an assistant"
      size="sm"
      className="min-w-8"
      onChange={(e) => {
        const assistant = assistants?.data.find(
          (assistant) => assistant.id === e.target.value
        )
        onSelectAssistant(assistant || null)
      }}
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
