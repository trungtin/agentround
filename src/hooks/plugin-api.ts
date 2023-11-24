import { useMutation } from '@/context/swr'
import { Threads } from '@/types'
import { Assistants } from 'openai/resources/beta/assistants/assistants.mjs'

export const useCreateAssistant = () => {
  return useMutation<Assistants.AssistantCreateParams, Assistants.Assistant>(
    '/assistants'
  )
}
export const useCreateThread = () => {
  return useMutation<Threads.ThreadCreateParams, Threads.Thread>('/threads')
}
