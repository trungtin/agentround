// copy from https://github.com/mathieudutour/gatsby-digital-garden

import { createContext, useContext } from 'react'

type StackedPageState = {
  obstructed: boolean
  overlay: boolean
  highlighted: boolean
  active: boolean
  id: string
}

export type ScrollState = {
  [id: string]: StackedPageState
}

export const StackedPagesContext = createContext<{
  stackedPages: { id: string }[]
  stackedPageStates: ScrollState
  navigateToStackedPage: (to: string, index?: number) => void
  highlightStackedPage: (id: string, highlighted?: boolean) => void
}>({
  stackedPages: [],
  stackedPageStates: {},
  navigateToStackedPage: () => {},
  highlightStackedPage: () => {},
})

export const StackedPagesIndexContext = createContext<number>(0)

export const StackedPagesProvider = StackedPagesContext.Provider
export const PageIndexProvider = StackedPagesIndexContext.Provider

export const StackedPageStateContext = createContext<StackedPageState>({
  obstructed: false,
  overlay: false,
  highlighted: false,
  active: false,
  id: '',
})

export const StackedPageStateProvider = StackedPageStateContext.Provider
export const useStackedPageState = () => useContext(StackedPageStateContext)
