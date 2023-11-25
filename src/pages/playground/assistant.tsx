import PlaygroundHeader from '@/components/playground/PlaygroundHeader'

import { AssistantProvider } from '@/context/AssistantContext'
import Head from 'next/head'
import React from 'react'

import dynamic from 'next/dynamic'

import { PluginProvider } from '@/context/plugin'
import CreateMenu from '@/components/playground/menu/CreateMenu'

const ThreadsContainer = dynamic(
  () => import('@/components/playground/threads/ThreadsContainer'),
  {
    ssr: false,
  }
)

export default function Playground() {
  return (
    <React.Fragment>
      <Head>
        <title>OpenAI Playground Assistant</title>
      </Head>
      <main className="max-w-screen relative flex h-screen max-h-screen min-h-screen w-screen flex-col">
        <AssistantProvider>
          <PluginProvider>
            <PlaygroundHeader
              rightActions={
                <>
                  <CreateMenu />
                </>
              }
            />
            <div className="flex h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] grow flex-row">
              <ThreadsContainer></ThreadsContainer>
            </div>
          </PluginProvider>
        </AssistantProvider>
      </main>
    </React.Fragment>
  )
}

export function getServerSideProps(context) {
  return {
    props: {},
  }
}
