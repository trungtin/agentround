import useSWR from 'swr'
import { useAuth } from './AuthProvider'

export function useApi<T>(url: string | null) {
  const { token } = useAuth()

  const fetcher = (url) =>
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json())

  // Add /api prefix if not present
  if (url && !url.startsWith('/api')) {
    url = `/api${url.startsWith('/') ? '' : '/'}${url}`
  }

  return useSWR<T>(url, fetcher)
}
