'use client'

import { useCallback } from 'react'
// import { Helmet } from 'react-helmet'

import useWindowWidth from '@/components/hooks/useWindowWidth'
import { useStackedPagesProvider } from '@/components/stacked/hooks'
import { PageIndexProvider } from '@/components/stacked/contexts'
import Thread from './Thread'

const NOTE_WIDTH = 576 // w-xl

const StackedPageWrapper = ({ i, ...rest }) => (
  <PageIndexProvider value={i}>
    <ThreadWrapper {...rest} i={i} />
  </PageIndexProvider>
)
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
        className={`note-container px-4 flex flex-col ${
          // TODO: add accent and extract bg color to theme
          highlighted ? 'bg-white' : 'bg-white'
        } static w-full max-w-full flex-shrink-0 flex-col overflow-y-auto md:flex-shrink md:flex-row md:overflow-y-scroll lg:sticky lg:max-w-max lg:w-[${NOTE_WIDTH}]`}
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

function ThreadsContainer({
  thread_ids,
  thread,
}: {
  thread_ids: string[]
  thread: any
}) {
  const [width] = useWindowWidth()

  const [state, scrollContainer] = useStackedPagesProvider({
    pages: thread_ids.map((id) => ({ id })),
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
  return (
    <div
      ref={scrollContainer}
      className="flex min-w-0 flex-1 flex-grow overflow-x-auto overflow-y-hidden"
    >
      <div
        className={`note-columns-container min-w-unset w-full flex-grow transition duration-100 md:w-full`}
        style={{
          width: NOTE_WIDTH * pages.length + 1,
        }}
      >
        {/* Render the stacked pages */}
        {pages.map((page, i) => (
          <StackedPageWrapper
            i={i}
            key={page.id}
            id={page.id}
            title={page.id}
            overlay={
              stackedPageStates[page.id] && stackedPageStates[page.id].overlay
            }
            obstructed={
              indexToShow !== undefined
                ? false
                : stackedPageStates[page.id] &&
                  stackedPageStates[page.id].obstructed
            }
            highlighted={
              stackedPageStates[page.id] &&
              stackedPageStates[page.id].highlighted
            }
          >
            <Thread thread_id={page.id} />
          </StackedPageWrapper>
        ))}
      </div>
    </div>
  )
}

export default ThreadsContainer
