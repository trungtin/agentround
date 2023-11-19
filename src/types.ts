// OpenAI

import OpenAI, { APIError } from 'openai'

export interface CursorPageResponse<Item> {
  data: Array<Item>
  first_id: string
  last_id: string
  has_more: boolean
}

export { APIError }
export type APIError = InstanceType<typeof APIError>

export import Threads = OpenAI.Beta.Threads
export import Assistants = OpenAI.Beta.Assistants
export import Files = OpenAI.Files
export import Runs = OpenAI.Beta.Threads.Runs
