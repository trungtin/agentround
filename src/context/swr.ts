import useSWR, { SWRConfiguration } from 'swr'
import useSWRMutation, {
  MutationFetcher,
  SWRMutationConfiguration,
  TriggerWithArgs,
  TriggerWithoutArgs,
} from 'swr/mutation'

import { useCallback } from 'react'
import { useAuth } from './AuthProvider'

/**
 * options to pass to the fetcher function
 * @property headers headers to pass to the request
 * @property method HTTP method
 * @property query query params to append to the url so that we can create a static key for swr
 *
 */
type FetcherOptions = {
  headers?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean>
} | null

/**
 * private hook to create a fetcher function
 *
 * @param method HTTP method
 * @param fetcherOptions options to pass to fetch
 * @returns
 */
function useFetcher(fetcherOptions: FetcherOptions = null) {
  const { token } = useAuth()

  const fetcher = useCallback(
    // extra arg is used to pass the body/form-data of the request
    (url: string, { arg }: { arg?: any } = {}) => {
      if (fetcherOptions?.query) {
        const params = new URLSearchParams(
          fetcherOptions.query as Record<string, string>
        )

        url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
      }
      return fetch(url, {
        method: fetcherOptions?.method || 'GET',
        body: arg
          ? arg instanceof FormData
            ? arg
            : JSON.stringify(arg)
          : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
          ...fetcherOptions?.headers,
        },
      }).then((res) => res.json())
    },
    [token, fetcherOptions]
  )

  return fetcher
}
function formatApiUrl(url: string | null) {
  // Add /api prefix if not present
  if (url && !url.startsWith('/api')) {
    url = `/api${url.startsWith('/') ? '' : '/'}${url}`
  }
  return url
}

/**
 * hook to fetch data from the server
 *
 * @param url url to fetch
 * @param config swr config
 * @returns
 *
 * @typeParam Data response data type
 *
 */
export function useApi<Data = any>(
  url: string | null,
  config: SWRConfiguration | undefined = undefined,
  fetcherOptions: FetcherOptions = null
) {
  const fetcher = useFetcher(fetcherOptions)

  if (!config) config = {}
  if (!('revalidateOnFocus' in config)) {
    config.revalidateOnFocus = false
  }
  return useSWR<Data>(formatApiUrl(url), fetcher, config)
}
/**
 * hook to mutate data on the server and revalidate the data on success
 *
 * @param url url to fetch
 * @param config swr config
 * @param fetcherOptions fetcher options
 * @returns
 *
 * @typeParam Body request body type
 * @typeParam Data response data type
 *
 */
export function useMutation<Body = any, Data = Body>(
  url: string | null,
  config:
    | SWRMutationConfiguration<Data, unknown, any, Body>
    | undefined = undefined,
  fetcherOptions: FetcherOptions = null
) {
  if (!fetcherOptions) fetcherOptions = {}
  if (!fetcherOptions.method) fetcherOptions.method = 'POST'

  const fetcher = useFetcher(fetcherOptions)
  return useSWRMutation<Data, unknown, any, Body>(
    formatApiUrl(url) as any,
    fetcher as MutationFetcher<Data, any, Body>,
    config
  )
}

// trigger type of useMutation
export type Mutator<Body = any, Data = Body> = [Body] extends [never]
  ? TriggerWithoutArgs<Data, unknown, any, Body>
  : TriggerWithArgs<Data, unknown, any, Body>
