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
  return new Response('hello world')
}
