import React from 'react'

const getWindowWidth = () => {
  // default to 0 or undefined?
  return typeof window === 'undefined' ? 0 : window.innerWidth
}

const useWindowWidth = () => {
  const [width, setWidth] = React.useState(getWindowWidth)

  React.useEffect(() => {
    const handleResize = () => {
      setWidth(getWindowWidth())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return [width]
}

export default useWindowWidth
