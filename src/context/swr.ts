import useSWR, { MutatorOptions, SWRConfiguration, useSWRConfig } from 'swr'
import useSWRMutation, {
  MutationFetcher,
  SWRMutationConfiguration,
  TriggerWithArgs,
  TriggerWithoutArgs,
} from 'swr/mutation'

import { APIError } from '@/utils/errors'
import { useCallback, useMemo } from 'react'
import { useAuth } from './AuthProvider'

type FetcherMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * options to pass to the fetcher function
 * @property headers headers to pass to the request
 * @property method HTTP method
 * @property query query params to append to the url so that we can create a static key for swr
 *
 */
type FetcherOptions<M extends FetcherMethods = FetcherMethods> = {
  headers?: Record<string, string>
  method?: M
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
    (
      url: string,
      { arg }: { arg?: any } = {},
      callOptions: FetcherOptions = {}
    ) => {
      const options = Object.assign({}, fetcherOptions, callOptions)

      if (options?.query) {
        const params = new URLSearchParams(
          options.query as Record<string, string>
        )

        url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`
      }
      return fetch(url, {
        method: options?.method || 'GET',
        body: arg
          ? arg instanceof FormData
            ? arg
            : JSON.stringify(arg)
          : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
      }).then((res) =>
        res.json().then((json) => {
          // openai api error
          if ('error' in json) {
            throw new APIError(
              res.status,
              json.error,
              json.error?.message,
              res.headers
            )
          }
          return json
        })
      )
    },
    [token, fetcherOptions]
  )

  return fetcher
}
function formatApiUrl(url: string | null | undefined) {
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
  url: string | null | undefined,
  config: SWRConfiguration | undefined = undefined,
  fetcherOptions: FetcherOptions = null
) {
  const fetcher = useFetcher(fetcherOptions)

  if (!config) config = {}
  if (!('revalidateOnFocus' in config)) {
    config.revalidateOnFocus = false
  }
  // formatApiUrl here is needed to make sure the key is stable
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
  url: string | null | undefined,
  config:
    | SWRMutationConfiguration<Data, unknown, any, Body>
    | undefined = undefined,
  fetcherOptions: FetcherOptions = null
) {
  if (!fetcherOptions) fetcherOptions = {}
  if (!fetcherOptions.method) fetcherOptions.method = 'POST'

  const fetcher = useFetcher(fetcherOptions)
  return useSWRMutation<Data, unknown, any, Body>(
    // formatApiUrl here is needed to make sure that the key is stable
    formatApiUrl(url) as any,
    fetcher as MutationFetcher<Data, any, Body>,
    config
  )
}

const defaultMutateFetcherOptions = {
  method: 'POST' as const,
}

/**
 * Mutate function similar to calling fetch directly but with the benefits of updating swr cache
 * @param presetFetchOptions
 * @returns
 */
export function useDeferredMutate(
  presetFetchOptions: FetcherOptions = defaultMutateFetcherOptions
) {
  const { mutate } = useSWRConfig()
  const fetcher = useFetcher()

  return useMemo(
    () => ({
      mutate: <Data = any>(
        url: string,
        body?: any,
        fetchOptions?: FetcherOptions,
        options?: MutatorOptions
      ) => {
        const formattedUrl = formatApiUrl(url)!
        return mutate<Data>(
          formattedUrl,
          fetcher(
            formattedUrl,
            { arg: body },
            Object.assign({}, fetchOptions, presetFetchOptions)
          ),
          options
        )
      },
    }),
    [mutate, fetcher, presetFetchOptions]
  )
}

const defaultQueryFetcherOptions = {
  method: 'GET' as const,
}

/**
 * Query function similar to fetch but with the benefits of also update swr cache with the same key
 * @param presetFetchOptions
 * @returns
 */
export function useDeferredQuery(
  presetFetchOptions: FetcherOptions<'GET'> = defaultQueryFetcherOptions
) {
  if (presetFetchOptions?.method != 'GET') {
    throw new Error('useDeferredQuery must use with "GET" method only')
  }
  const result = useDeferredMutate(presetFetchOptions)
  return useMemo(() => {
    const { mutate, ...rest } = result
    // rename mutate => query
    return { query: mutate, ...rest }
  }, [result])
}

// trigger type of useMutation
export type Mutator<Body = any, Data = Body> = [Body] extends [never]
  ? TriggerWithoutArgs<Data, unknown, any, Body>
  : TriggerWithArgs<Data, unknown, any, Body>
