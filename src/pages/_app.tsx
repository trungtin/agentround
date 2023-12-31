import ClientOnly from '@/components/misc/ClientOnly'
import GoogleAnalytics from '@/components/misc/GoogleAnalytics'
import { AuthProvider } from '@/context/AuthProvider'
import OpenAIProvider from '@/context/OpenAIProvider'
import { FirebaseAppProvider } from '@/context/firebase'
import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  if (typeof window !== 'undefined') {
    const isDarkSet = localStorage.theme === 'dark'
    const isThemeStored = 'theme' in localStorage
    const isDarkPreferred = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    // TODO: handle dark mode
    // if (isDarkSet || (!isThemeStored && isDarkPreferred)) {
    //   document.documentElement.classList.add('dark')
    // } else {
    //   document.documentElement.classList.remove('dark')
    // }
  }

  return (
    <>
      <ClientOnly>
        <GoogleAnalytics />
      </ClientOnly>
      <ChakraProvider>
        <FirebaseAppProvider>
          <AuthProvider>
            <OpenAIProvider>
              <Component {...pageProps} />
            </OpenAIProvider>
          </AuthProvider>
        </FirebaseAppProvider>
      </ChakraProvider>
      <Analytics />
    </>
  )
}
