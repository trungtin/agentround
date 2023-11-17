// OpenAI

import OpenAI from 'openai'

export interface CursorPageResponse<Item> {
  data: Array<Item>
  first_id: string
  last_id: string
  has_more: boolean
}

export import Threads = OpenAI.Beta.Threads
export import Assistants = OpenAI.Beta.Assistants
export import Files = OpenAI.Files
