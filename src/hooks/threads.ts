import { useMutation } from '@/context/swr'
import { CursorPageResponse, Files, Threads } from '@/types'
import { useCallback } from 'react'

export function useAddMessage({
  thread,
}: {
  thread: Threads.Thread | undefined
}) {
  const { trigger: addFiles } = useMutation<unknown, Files.FileObject>(
    '/files',
    undefined
  )
  const { trigger: addMessage } = useMutation<
    Threads.MessageCreateParams,
    Threads.ThreadMessage
  >(thread && `/api/threads/${thread.id}/messages`)

  return useCallback(
    async (input: string, files: File[]) => {
      if (!input && !files.length) {
        return
      }
      try {
        let createdFiles = await Promise.all(
          files.map((file) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('purpose', 'assistants')
            return addFiles(formData)
          })
        )

        return await addMessage(
          {
            role: 'user',
            content: input,
            file_ids: createdFiles.map((file) => file.id),
          },
          {
            // @ts-ignore due to types discrepancy
            optimisticData(
              currentData: CursorPageResponse<Threads.ThreadMessage>
            ) {
              if (!currentData) {
                return
              }
              return {
                ...currentData,
                data: [
                  {
                    id: 'optimistic',
                    role: 'user',
                    file_ids: createdFiles.map((file) => file.id),
                    content: [{ type: 'text', text: { value: input } }],
                  },
                  ...currentData.data,
                ],
              }
            },
          }
        )
      } catch (err) {
        // TODO: handle error
        console.error(err)
      }
    },
    [addMessage, addFiles]
  )
}
