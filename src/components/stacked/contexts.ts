// copy from https://github.com/mathieudutour/gatsby-digital-garden

import { createContext } from 'react'

export type ScrollState = {
  [id: string]: {
    obstructed: boolean
    overlay: boolean
    highlighted: boolean
    active: boolean
  }
}

export const StackedPagesContext = createContext<{
  stackedPages: { id: string; data: any }[]
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
