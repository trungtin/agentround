import { NextRequest, NextResponse } from 'next/server'
export const config = {
  runtime: 'edge',
  api: {
    // with bodyParser, the form data request will result in boundary not found error
    bodyParser: false,
  },
}

export default async function handler(
  req: NextRequest,
  res: NextResponse<Response>
) {
  const searchParams = req.nextUrl.searchParams
  const paths = searchParams.getAll('paths')
  searchParams.delete('paths')

  const knownPaths = ['threads', 'files', 'assistants']
  console.log('paths: ', paths)
  if (knownPaths.indexOf(paths[0]) === -1) {
    return new Response(`url ${req.url} not found`, { status: 404 })
  }

  const headers = req.headers
  const passthroughHeaders = [
    'authorization',
    // 'content-type' and 'content-length' will not work with multipart/form-data
  ]
  const extraHeaders = Object.fromEntries(
    [...headers.entries()].filter(([key]) => passthroughHeaders.includes(key))
  )

  const isFormData = req.headers
    .get('content-type')
    ?.includes('multipart/form-data')

  const url = `https://api.openai.com/v1/${paths.join('/')}`
  const body = isFormData ? await req.formData() : req.body
  return fetch(url, {
    headers: {
      'OpenAI-Beta': 'assistants=v1',
      ...extraHeaders,
    },
    method: req.method,
    body: body,
  }).catch((err) => {
    console.error(err)
    return new Response(err.message, { status: 500 })
  })
}
