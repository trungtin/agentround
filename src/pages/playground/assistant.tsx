import PlaygroundHeader from '@/components/playground/PlaygroundHeader'

import { AssistantProvider } from '@/context/AssistantContext'
import Head from 'next/head'
import React from 'react'

import dynamic from 'next/dynamic'

import PlaygroundModeSelector from '@/components/playground/PlaygroundModeSelector'
import CreateMenu from '@/components/playground/menu/CreateMenu'
import { PluginProvider } from '@/context/plugin'
import ClientOnly from '@/components/misc/ClientOnly'

const PanelsContainer = dynamic(
  () => import('@/components/playground/PanelsContainer'),
  {
    ssr: false,
  }
)

export default function Playground() {
  return (
    <React.Fragment>
      <Head>
        <title>AgentRound: next-gen agent platform</title>
      </Head>
      <main className="max-w-screen relative flex h-screen max-h-screen min-h-screen w-screen flex-col">
        <AssistantProvider>
          <PluginProvider>
            <ClientOnly>
              <PlaygroundModeSelector />
            </ClientOnly>
            <PlaygroundHeader
              rightActions={
                <>
                  <CreateMenu />
                </>
              }
            />
            <div className="flex h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] grow flex-row">
              <PanelsContainer></PanelsContainer>
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
