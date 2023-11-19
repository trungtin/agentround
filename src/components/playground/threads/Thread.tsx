import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { APIError } from '@/utils/errors'
import { memo, useEffect } from 'react'
import ThreadHeader from './ThreadHeader'
import ThreadInput from './ThreadInput'
import ThreadMessages from './ThreadMessages'

const waitingRunStatuses = ['queued', 'in_progress', 'requires_action']
const stoppedRunStatuses = [
  'completed',
  'expired',
  'cancelling',
  'cancelled',
  'failed',
]

const waitingStepStatuses = ['in_progress']
const stoppedStepStatuses = ['completed', 'expired', 'failed', 'cancelled']

function ThreadRunStep({ step }: { step: Threads.Runs.RunStep }) {
  return (
    <div key={step.id} className="flex flex-row items-center justify-between">
      <div className="text-xs">{step.id}</div>
      <div className="text-xs">{step.status}</div>
    </div>
  )
}

function ThreadRunStatus({
  thread,
  refreshMessages,
}: {
  thread: Threads.Thread | undefined
  refreshMessages: () => void
}) {
  const { data: runs, mutate: refreshRuns } = useApi<
    CursorPageResponse<Threads.Runs.Run>
  >(thread ? `/threads/${thread.id}/runs` : null, undefined, {
    query: { limit: 1 },
  })

  const waitingRun = runs?.data?.find((run) =>
    waitingRunStatuses.includes(run.status)
  )

  const { data: runSteps } = useApi<CursorPageResponse<Threads.Runs.RunStep>>(
    thread && waitingRun
      ? `/threads/${thread.id}/runs/${waitingRun.id}/steps`
      : null,
    {
      refreshInterval: stoppedRunStatuses.includes(waitingRun?.status!)
        ? 0
        : 3000,
    }
  )

  useEffect(() => {
    if (
      runSteps?.data.every((step) => stoppedStepStatuses.includes(step.status))
    ) {
      if (waitingRunStatuses.includes(waitingRun?.status!)) {
        refreshRuns()
      }
      refreshMessages()
    }
  }, [runSteps, refreshRuns, refreshMessages, waitingRun?.status])

  if (!waitingRun) {
    return null
  }
  // render steps
  return (
    <div className="mt-2 flex flex-col">
      {runSteps?.data?.map((step) => (
        <ThreadRunStep step={step} key={step.id} />
      ))}
    </div>
  )
}

function ErrorThread({ error }: { error: APIError }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-4">
      <div className="text-rose-400">
        {error.status == 404
          ? 'This thread has been deleted. Please close it.'
          : 'Error loading thread'}
      </div>
    </div>
  )
}

function Thread({ threadId }: { threadId: string }) {
  const { data: thread, error } = useApi<Threads.Thread>(
    `/api/threads/${threadId}`
  )
  // @ts-ignore
  const preferredAssistantId = thread?.metadata?.preferred_assistant_id
  const { data: preferredAssistant } = useApi<Assistants.Assistant>(
    preferredAssistantId ? `/api/assistants/${preferredAssistantId}` : null
  )

  const messagesPath = thread && `/api/threads/${threadId}/messages`
  const { data: messages, mutate: refreshMessages } =
    useApi<CursorPageResponse<Threads.ThreadMessage>>(messagesPath)
  const { trigger: addMessage } = useMutation<
    Threads.MessageCreateParams,
    Threads.ThreadMessage
  >(messagesPath)

  return (
    <div className="flex w-[540px] grow flex-col pb-4">
      <ThreadHeader
        assistant={preferredAssistant}
        thread={thread}
      ></ThreadHeader>

      <div className="flex grow flex-col justify-between">
        <div className="pb-4">
          {error && <ErrorThread error={error} />}
          {thread && (
            <ThreadMessages messages={messages?.data}></ThreadMessages>
          )}
          <ThreadRunStatus
            thread={thread}
            refreshMessages={refreshMessages}
          ></ThreadRunStatus>
        </div>
        <div className="sticky bottom-4 bg-white">
          <ThreadInput addMessage={addMessage} thread={thread} />
        </div>
      </div>
    </div>
  )
}

export default memo(Thread)
