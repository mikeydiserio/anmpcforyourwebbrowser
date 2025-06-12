// app/api/comments/route.ts
import { NextResponse } from 'next/server'
import { verifyRecaptcha } from '../../../utils'

// app/api/comments/route.ts
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const sampleId = searchParams.get('sampleId')

    // Add database query here
    const mockComments = [
      {
        id: '1',
        content: 'Great breakbeat!',
        sampleId: sampleId || '',
        createdAt: new Date().toISOString(),
        author: 'DJ Sample'
      }
    ]

    return NextResponse.json(mockComments)
  }


export async function POST(req: Request) {
    try {
      const { content, author, sampleId, recaptchaToken } = await req.json()

      // Verify reCAPTCHA
      const isHuman = await verifyRecaptcha(recaptchaToken)
      if (!isHuman) {
        return NextResponse.json(
          { error: 'ReCAPTCHA verification failed' },
          { status: 403 }
        )
      }

      // Add database persistence here
      const newComment = {
        id: Date.now().toString(),
        content,
        author,
        sampleId,
        createdAt: new Date().toISOString(),
        verified: true
      }

      return NextResponse.json(newComment)

    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
