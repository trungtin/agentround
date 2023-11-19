'use client'

import { useMemo } from 'react'
// import { Helmet } from 'react-helmet'

import useWindowWidth from '@/components/hooks/useWindowWidth'
import {
  PageIndexProvider,
  StackedPageStateProvider,
} from '@/components/stacked/contexts'
import { useStackedPagesProvider } from '@/components/stacked/hooks'
import { ThreadProvider } from '@/context/ThreadContext'
import { useSearchParams } from 'next/navigation'
import Thread from './Thread'
import { useAuth } from '@/context/AuthProvider'

const NOTE_WIDTH = 576 // w-xl

const ThreadWrapper = ({
  children,
  id,
  title,
  overlay,
  obstructed,
  highlighted,
  i,
}) => {
  return (
    <>
      <div
        className={`note-container flex flex-col px-4 ${
          // TODO: add accent and extract bg color to theme
          highlighted ? 'bg-white' : 'bg-white'
        } static w-full max-w-full flex-shrink-0 flex-col overflow-y-auto md:flex-shrink md:flex-row md:overflow-y-scroll lg:sticky lg:max-w-max lg:w-[${NOTE_WIDTH}] border-gray-100`}
        style={{
          left: 40 * i,
          right: -585,
          boxShadow: overlay ? `0 0 8px rgba(0, 0, 0, 0.125)` : '',
        }}
      >
        <div
          className={`hidden transition-opacity duration-100 ${
            obstructed ? 'opacity-100' : 'opacity-0'
          } md:block`}
        >
          <div className="absolute z-10 origin-left rotate-90 transform pb-2">
            {/* <LinkToStacked class="decoration-none font-bold" to={id}> */}
            {title || id}
            {/* </LinkToStacked> */}
          </div>
        </div>
        <div
          className={`flex min-h-full flex-col transition-opacity duration-100 ${
            obstructed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {children}
        </div>
      </div>
    </>
  )
}

function MissingTokenContainer() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="mb-2 text-xl font-semibold">No API token</div>
      <div className="text-md font-medium text-gray-500">
        Add your API token using the top right button.
      </div>
    </div>
  )
}
function EmptyThreadsContainer() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div className="mb-2 text-xl font-semibold">No open threads</div>
      <div className="text-md font-medium text-gray-500">
        Try creating one using the top right button.
      </div>
    </div>
  )
}

type Props = {}

function ThreadsContainer(props: Props) {
  const { token } = useAuth()
  const [width] = useWindowWidth()

  const stacked = useSearchParams().getAll('stacked').join(',')
  // support both ?stacked=1,2,3 and ?stacked=1&stacked=2&stacked=3
  const threads = useMemo(() => {
    const ids = stacked.split(',').filter(Boolean)

    return ids.map((id) => ({ id }))
  }, [stacked])

  const [state, scrollContainer] = useStackedPagesProvider({
    stackedPages: threads,
    pageWidth: NOTE_WIDTH,
  })
  const { stackedPages, stackedPageStates } = state

  let pages = stackedPages
  let indexToShow
  if (width < 768) {
    const activeSlug = Object.keys(state.stackedPageStates).find(
      (id) => state.stackedPageStates[id].active
    )
    indexToShow = state.stackedPages.findIndex((page) => page.id === activeSlug)
    if (indexToShow === -1) {
      indexToShow = state.stackedPages.length - 1
    }
    pages = [state.stackedPages[indexToShow]]
  }

  {
    /* <Helmet>
    <meta charSet="utf-8" />
  </Helmet>
  <Header siteMetadata={siteMetadata} /> */
  }

  if (!token) {
    return <MissingTokenContainer />
  }

  return (
    <div
      ref={scrollContainer}
      className="flex min-w-0 flex-1 flex-grow overflow-x-auto overflow-y-hidden"
    >
      <div
        className={`note-columns-container min-w-unset w-full flex-grow divide-x transition duration-100 md:w-full`}
        style={{
          width: NOTE_WIDTH * pages.length + 1,
        }}
      >
        {/* Render the stacked pages */}
        {pages.length === 0 && <EmptyThreadsContainer />}
        {pages.map((page, i) => {
          const obstructed =
            indexToShow !== undefined
              ? false
              : stackedPageStates[page.id] &&
                stackedPageStates[page.id].obstructed
          const overlay =
            stackedPageStates[page.id] && stackedPageStates[page.id].overlay
          const highlighted =
            stackedPageStates[page.id] && stackedPageStates[page.id].highlighted
          return (
            <PageIndexProvider value={i} key={page.id}>
              <ThreadWrapper
                i={i}
                id={page.id}
                title={page.id}
                overlay={overlay}
                obstructed={obstructed}
                highlighted={highlighted}
              >
                <StackedPageStateProvider
                  value={{ active: false, obstructed, overlay, highlighted }}
                >
                  <ThreadProvider threadId={page.id}>
                    <Thread threadId={page.id} />
                  </ThreadProvider>
                </StackedPageStateProvider>
              </ThreadWrapper>
            </PageIndexProvider>
          )
        })}
      </div>
    </div>
  )
}

export default ThreadsContainer
