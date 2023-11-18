/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/playground/assistant',
        permanent: false,
      },
      {
        source: '/playground',
        destination: '/playground/assistant',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
