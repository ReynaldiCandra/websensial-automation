import { NextRequest, NextResponse } from 'next/server'
import {
  sendInvoiceEmail,
  sendQuotationEmail,
  sendWelcomeEmail,
} from '@/lib/services/email-service'

export async function POST(request: NextRequest) {
  try {
    const { type, to, ...data } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    let success = false

    switch (type) {
      case 'invoice':
        success = await sendInvoiceEmail(
          to,
          data.invoiceNumber,
          data.invoiceUrl,
          data.totalAmount
        )
        break

      case 'quotation':
        success = await sendQuotationEmail(
          to,
          data.quotationNumber,
          data.quotationUrl,
          data.expiresAt
        )
        break

      case 'welcome':
        success = await sendWelcomeEmail(to, data.customerName)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Email API Error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
