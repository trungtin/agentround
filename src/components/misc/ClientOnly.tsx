import dynamic from 'next/dynamic'

const ClientOnly = ({ children }) => children

export default dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
})
