import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(
  req: NextRequest,
  res: NextResponse<Response>
) {
  const searchParams = req.nextUrl.searchParams
  const paths = searchParams.getAll('paths')
  searchParams.delete('paths')

  const knownPaths = ['threads', 'files', 'assistants']
  if (knownPaths.indexOf(paths[0]) === -1) {
    return new Response(`url ${req.url} not found`, { status: 404 })
  }

  return fetch(`https://api.openai.com/v1/${paths.join('/')}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.headers.get('authorization')!,
      'OpenAI-Beta': 'assistants=v1',
    },
    method: req.method,
    body: req.body,
  })
}
