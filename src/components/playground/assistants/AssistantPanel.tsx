import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Models } from '@/types'
import { memo, useMemo } from 'react'
import { PanelLoadingError } from '../panel/Panel'
import AssistantPanelHeader from './AssistantPanelHeader'

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'

import { NEW_ASST_ID } from '@/utils/constants'
import { useAssistantContext } from '@/context/AssistantContext'

type FormData = {
  name: string
  instructions: string
  model: string
}

function valueFromAsst(asst: Assistants.Assistant | undefined) {
  return {
    name: asst?.name || '',
    instructions: asst?.instructions || '',
    model: asst?.model || '',
  }
}

function FormBody({
  assistant,
  createMode,
}: {
  assistant?: Assistants.Assistant
  createMode: boolean
}) {
  const { trigger: upsertAssistant, isMutating } = useMutation<
    Assistants.AssistantUpdateParams,
    Assistants.Assistant
  >(
    createMode
      ? '/api/assistants'
      : assistant
      ? `/api/assistants/${assistant.id}`
      : null
  )

  const {
    urls: { appendPanel },
  } = useAssistantContext()

  const { register, handleSubmit, control, reset, formState } =
    useForm<FormData>({
      defaultValues: valueFromAsst(assistant),
    })

  const models = useApi<CursorPageResponse<Models.Model>>(`/models`, {
    revalidateOnFocus: false,
  })

  const validModels = useMemo(
    () =>
      models.data?.data
        .filter(
          (model) =>
            model.id.startsWith('gpt-') && model.id !== 'gpt-3.5-turbo-0301'
        )
        .sort((a, b) => (a.id > b.id ? -1 : 1)) || [],
    [models]
  )

  const onSubmit = handleSubmit(async (data) => {
    const res = await upsertAssistant(
      {
        instructions: data.instructions,
        model: data.model,
        name: data.name,
      },
      {}
    )
    reset(valueFromAsst(res))
    if (createMode) {
      appendPanel(res, NEW_ASST_ID)
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex grow flex-col">
      <div className="space-y-4">
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input {...register('name')} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Instructions</FormLabel>
          <Textarea {...register('instructions')} rows={10} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Model</FormLabel>
          <Controller
            name="model"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                {validModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormControl>
      </div>

      <div className="sticky bottom-0 -my-8 mt-auto w-full bg-white py-5">
        <div
          className={`flex flex-row space-x-2 ${
            formState.isDirty ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-200`}
        >
          <div className="grow">
            <Button
              type="button"
              colorScheme="gray"
              className="w-full"
              size="sm"
              onClick={() => {
                reset()
              }}
              isDisabled={isMutating}
            >
              Revert changes
            </Button>
          </div>
          <div className="grow">
            <Button
              type="submit"
              colorScheme="green"
              className="w-full"
              size="sm"
              isLoading={isMutating}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function AssistantPanel({
  asstId,
  panelWidth,
}: {
  asstId: string
  panelWidth: number | string
}) {
  const createMode = asstId == NEW_ASST_ID
  const { data: asst, error } = useApi<Assistants.Assistant>(
    !createMode ? `/api/assistants/${asstId}` : null
  )

  return (
    <div className="flex grow flex-col pb-4" style={{ width: panelWidth }}>
      <AssistantPanelHeader
        assistant={asst}
        createMode={createMode}
      ></AssistantPanelHeader>

      <div className="flex grow flex-col justify-between">
        <div className="flex grow flex-col py-4">
          {error && (
            <PanelLoadingError>
              {error.status == 404
                ? 'This agent has been deleted. Please close this panel.'
                : 'Error loading assistant'}
            </PanelLoadingError>
          )}
          {(asst || createMode) && (
            <FormBody assistant={asst} createMode={createMode} />
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(AssistantPanel)
