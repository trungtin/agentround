import { useApi, useMutation } from '@/context/swr'
import { Assistants, CursorPageResponse, Threads } from '@/types'
import { APIError } from '@/utils/errors'
import { memo, useCallback, useEffect } from 'react'
import ThreadHeader from './ThreadHeader'
import ThreadInput from './ThreadInput'
import ThreadMessages from './ThreadMessages'
import { useLastRun } from '@/context/api'
import { stoppedStepStatuses, waitingRunStatuses } from './runs'

function ThreadRunStep({ step }: { step: Threads.Runs.RunStep }) {
  return (
    <div key={step.id} className="flex flex-row items-center justify-between">
      <div className="text-xs">{step.id}</div>
      <div className="text-xs">{step.status}</div>
    </div>
  )
}

function ThreadRunError({ run }: { run: Threads.Runs.Run | undefined }) {
  const { data: assistant } = useApi<Assistants.Assistant>(
    run?.assistant_id && `/assistants/${run.assistant_id}`,
    { revalidateOnMount: false }
  )
  return (
    <div>
      <div className="text-sm font-bold">{assistant?.name || 'Assistant'}</div>
      <div className="text-rose-400">{run?.last_error?.message}</div>
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
  const { data: lastRun, mutate: refreshRuns } = useLastRun(thread?.id)

  const { data: runSteps } = useApi<CursorPageResponse<Threads.Runs.RunStep>>(
    thread && lastRun && waitingRunStatuses.includes(lastRun.status)
      ? `/threads/${thread.id}/runs/${lastRun.id}/steps`
      : null,
    {
      refreshInterval: 3000,
    }
  )

  useEffect(() => {
    if (
      runSteps?.data.every((step) => stoppedStepStatuses.includes(step.status))
    ) {
      if (waitingRunStatuses.includes(lastRun?.status!)) {
        refreshRuns()
      }
      refreshMessages()
    }
  }, [runSteps, refreshRuns, refreshMessages, lastRun?.status])

  if (['expired', 'failed'].includes(lastRun?.status!)) {
    // render error if run is expired or failed
    return <ThreadRunError run={lastRun!} />
  }

  if (!waitingRunStatuses.includes(lastRun?.status!)) {
    // render nothing if run is not waiting
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

function Thread({
  threadId,
  threadWidth,
}: {
  threadId: string
  threadWidth: number
}) {
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

  const threadRef = useCallback((node) => {
    if (!node) return

    // scroll to last message when the element is resized (e.g. when there is a new message)
    const resizeObserver = new ResizeObserver(() => {
      let scrollElement = node
      // find the thread container, which is the scrollable parent
      while (scrollElement) {
        if (scrollElement.classList.contains('thread-container')) {
          break
        }
        scrollElement = scrollElement.parentElement
      }
      if (!scrollElement) return
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth',
      })
    })
    resizeObserver.observe(node)
  }, [])

  return (
    <div
      className="flex grow flex-col pb-4"
      style={{ width: `calc(${threadWidth}px - 2rem - 1px)` }}
      ref={threadRef}
    >
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
          <ThreadInput thread={thread} />
        </div>
      </div>
    </div>
  )
}

export default memo(Thread)
