import {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from 'react'
import throttle from 'lodash.throttle'
import {
  StackedPagesContext,
  StackedPagesIndexContext,
  ScrollState,
} from './contexts'
import { useAssistantContext } from '@/context/AssistantContext'

const throttleTime = 16
const obstructedOffset = 120

function useScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scroll, setScroll] = useState(0)
  const [width, setWidth] = useState(0)

  const scrollObserver = useCallback(() => {
    if (!containerRef.current) {
      return
    }
    setScroll(containerRef.current.scrollLeft)
    setWidth(containerRef.current.getBoundingClientRect().width)
  }, [setScroll, setWidth, containerRef])

  const throttledScrollObserver = useMemo(
    () => throttle(scrollObserver, throttleTime),
    [scrollObserver]
  )

  const setRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        // When the ref is first set (after mounting)
        node.addEventListener('scroll', throttledScrollObserver)
        containerRef.current = node
        window.addEventListener('resize', throttledScrollObserver)
        throttledScrollObserver() // initialization
      } else if (containerRef.current) {
        // When unmounting
        containerRef.current.removeEventListener(
          'scroll',
          throttledScrollObserver
        )
        window.removeEventListener('resize', throttledScrollObserver)
      }
    },
    [throttledScrollObserver]
  )

  return [scroll, width, setRef, containerRef] as const
}

export function useStackedPagesProvider({
  stackedPages,
  pageWidth,
  obstructedPageWidth = 40,
}: {
  stackedPages: { id: string }[]
  pageWidth: number
  obstructedPageWidth?: number
}) {
  const [scroll, containerWidth, setRef, containerRef] = useScroll()

  const [stackedPageStates, setStackedPageStates] = useState<ScrollState>(
    Object.fromEntries(
      stackedPages.map((x) => [
        x.id,
        {
          id: x.id,
          obstructed: false,
          highlighted: false,
          overlay: scroll > pageWidth - obstructedOffset,
          active: true,
        },
      ])
    )
  )

  useEffect(() => {
    // hack: delay scroll
    // but the flash is still there
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: 0,
          left: pageWidth * (stackedPages.length + 1),
          behavior: 'smooth',
        })
      }
    }, 100)
  }, [stackedPages, containerRef, pageWidth])

  const {
    urls: { appendPanel },
  } = useAssistantContext()

  // on scroll or on new page
  useEffect(() => {
    const acc: ScrollState = {}

    if (!containerRef.current) {
      setStackedPageStates(
        stackedPages.reduce((prev, x, i, a) => {
          prev[x.id] = {
            id: x.id,
            overlay: true,
            obstructed: false,
            highlighted: false,
            active: i === a.length - 1,
          }
          return prev
        }, acc)
      )
      return
    }

    setStackedPageStates(
      stackedPages.reduce((prev, x, i, a) => {
        prev[x.id] = {
          id: x.id,
          highlighted: false,
          overlay:
            scroll >
              Math.max(
                pageWidth * (i - 1) - (obstructedPageWidth * i - 2),
                0
              ) || scroll < Math.max(0, pageWidth * (i - 3)),
          obstructed:
            scroll >
              Math.max(
                pageWidth * (i + 1) -
                  obstructedOffset -
                  obstructedPageWidth * (i - 1),
                0
              ) || scroll + containerWidth < pageWidth * i + obstructedOffset,
          active: i === a.length - 1,
        }
        return prev
      }, acc)
    )
  }, [
    stackedPages,
    containerRef,
    containerWidth,
    scroll,
    setStackedPageStates,
    pageWidth,
    obstructedPageWidth,
  ])

  const navigateToStackedPage = useCallback(
    (to: string, index: number = 0) => {
      const existingPage = stackedPages.findIndex((x) => x.id === to)

      // if page exists, scroll to it
      if (existingPage !== -1 && containerRef.current) {
        setStackedPageStates((stackedPageStates) => {
          if (!stackedPageStates[to]) {
            return stackedPageStates
          }
          return Object.keys(stackedPageStates).reduce((prev, id) => {
            prev[id] = {
              ...stackedPageStates[id],
              highlighted: false,
              active: id === to,
            }
            return prev
          }, {} as ScrollState)
        })
        containerRef.current.scrollTo({
          top: 0,
          left:
            pageWidth * existingPage - (obstructedPageWidth * existingPage - 1),
          behavior: 'smooth',
        })
        return
      }
      // else, append page
      appendPanel(to)
    },
    [
      appendPanel,
      stackedPages,
      setStackedPageStates,
      pageWidth,
      obstructedPageWidth,
      containerRef,
    ]
  )

  const highlightStackedPage = useCallback(
    (id: string, highlighted?: boolean) => {
      setStackedPageStates((stackedPageStates) => {
        if (!stackedPageStates[id]) {
          return stackedPageStates
        }
        return {
          ...stackedPageStates,
          [id]: {
            ...stackedPageStates[id],
            highlighted:
              typeof highlighted !== 'undefined'
                ? highlighted
                : !stackedPageStates[id].highlighted,
          },
        }
      })
    },
    [setStackedPageStates]
  )

  const contextValue = useMemo(
    () => ({
      stackedPages,
      navigateToStackedPage,
      highlightStackedPage,
      stackedPageStates,
    }),
    [
      stackedPages,
      navigateToStackedPage,
      highlightStackedPage,
      stackedPageStates,
    ]
  )

  return [contextValue, setRef] as const
}

export function useStackedPages() {
  const {
    stackedPages,
    stackedPageStates,
    navigateToStackedPage,
    highlightStackedPage,
  } = useContext(StackedPagesContext)
  const index = useContext(StackedPagesIndexContext)

  const hookedNavigateToStackedPage = useCallback(
    (to: string) => navigateToStackedPage(to, index),
    [navigateToStackedPage, index]
  )

  return [
    stackedPages,
    stackedPageStates,
    hookedNavigateToStackedPage,
    highlightStackedPage,
  ] as const
}

export function useStackedPage() {
  const {
    stackedPages,
    stackedPageStates,
    navigateToStackedPage,
    highlightStackedPage,
  } = useContext(StackedPagesContext)
  const index = useContext(StackedPagesIndexContext)

  const hookedNavigateToStackedPage = useCallback(
    (to: string) => navigateToStackedPage(to, index),
    [navigateToStackedPage, index]
  )

  const currentPage = stackedPages[index]

  return [
    currentPage,
    currentPage ? stackedPageStates[currentPage.id] : {},
    index,
    hookedNavigateToStackedPage,
    highlightStackedPage,
  ] as const
}
