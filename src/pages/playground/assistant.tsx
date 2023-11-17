import ConfigSidebar from '@/components/playground/ConfigSidebar'
import PlaygroundHeader from '@/components/playground/PlaygroundHeader'

import PlaygroundProvider from '@/context/PlaygroundProvider'
import Head from 'next/head'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import dynamic from 'next/dynamic'

const ThreadsContainer = dynamic(
  () => import('@/components/playground/threads/ThreadsContainer'),
  {
    ssr: false,
  }
)

export default function Playground() {
  const params = useSearchParams()

  // support both ?stacked=1,2,3 and ?stacked=1&stacked=2&stacked=3
  const thread_ids = params
    .getAll('stacked')
    .reduce((acc, cur) => {
      return acc.concat(cur.split(','))
    }, [] as string[])
    .filter(Boolean)
  return (
    <React.Fragment>
      <Head>
        <title>OpenAI Playground Assistant</title>
      </Head>
      <main className="max-w-screen relative flex max-h-screen w-screen flex-col">
        <PlaygroundProvider>
          <PlaygroundHeader />
          <div className="flex h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] grow flex-row">
            <div className="flex grow flex-col items-stretch md:flex-row">
              <ThreadsContainer
                thread_ids={thread_ids}
                thread={null}
              ></ThreadsContainer>
            </div>
            {/* <ConfigSidebar /> */}
          </div>
        </PlaygroundProvider>
      </main>
    </React.Fragment>
  )
}

export function getServerSideProps(context) {
  return {
    props: {},
  }
}
