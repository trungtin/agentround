// OpenAI

import OpenAI from 'openai'

// NOTE: do not re-export types that have conflicting name with OpenAI package
// (e.g. APIError, ...) . Otherwise, the whole 'openai' package will be imported,
// which doesn't support browser environment.

export interface CursorPageResponse<Item> {
  data: Array<Item>
  first_id: string
  last_id: string
  has_more: boolean
}

export import Models = OpenAI.Models
export import Threads = OpenAI.Beta.Threads
export import Assistants = OpenAI.Beta.Assistants
export import Files = OpenAI.Files
export import Runs = OpenAI.Beta.Threads.Runs
