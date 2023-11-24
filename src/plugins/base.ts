import { Assistants, Threads } from '@/types'

export type PluginContext = {
  listAssistants: () => Promise<Assistants.Assistant[]>
  createAssistant: (
    assistant: Assistants.AssistantCreateParams
  ) => Promise<Assistants.Assistant>
  updateAssistant: (
    id: string,
    assistant: Assistants.AssistantUpdateParams
  ) => Promise<Assistants.Assistant | undefined>

  // TODO: only allow delete assistant if it is created by this plugin
  deleteAssistant: (id: string) => Promise<void>

  createThread: (thread: Threads.ThreadCreateParams) => Promise<Threads.Thread>
  appendThread: (thread: Threads.Thread) => void
  // TODO: only allow remove thread if it is created by this plugin
  removeThread: (thread_id: string) => void

  createRun: (run: Threads.RunCreateParams) => Promise<Threads.Run>
}

export type ExecutionContext = {
  message: string
}

type PluginOnMessageParams = { message: string }
type PluginOnMessageReturn = { message: string | undefined }

export abstract class BasePlugin {
  abstract plugin_name: string
  abstract display_name: string
  abstract version: string
  abstract author: string

  context: PluginContext

  constructor(context: PluginContext) {
    this.context = context
  }

  async apply(ctx: ExecutionContext): Promise<void> {}

  /**
   * Called when a message is received from the user with this plugin mentioned
   * @param message The message sent by the user
   * @returns The message that will be added to the thread, or undefined if no message should be added
   */
  async handleMentionedMessage({
    message,
  }: PluginOnMessageParams): Promise<PluginOnMessageReturn> {
    return {
      message,
    }
  }
}
