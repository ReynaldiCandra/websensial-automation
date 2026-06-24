import sgMail from '@sendgrid/mail'

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = options.from || process.env.SENDGRID_FROM_EMAIL

  if (!apiKey) {
    console.error('[v0] SENDGRID_API_KEY is not configured')
    return false
  }

  if (!fromEmail) {
    console.error('[v0] SENDGRID_FROM_EMAIL is not configured')
    return false
  }

  sgMail.setApiKey(apiKey)

  try {
    const msg = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      html: options.html,
    }

    await sgMail.send(msg)
    console.log(`[v0] Email sent successfully to ${options.to}`)
    return true
  } catch (error) {
    console.error('[v0] Email Service Error:', error)
    return false
  }
}

export async function sendInvoiceEmail(
  customerEmail: string,
  invoiceNumber: string,
  invoiceUrl: string,
  totalAmount: number
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invoice #${invoiceNumber}</h2>
      <p>Dear Customer,</p>
      <p>Your invoice is ready. Please find the details below:</p>
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Total Amount:</strong> $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p><a href="${invoiceUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Invoice</a></p>
      <hr />
      <p>Thank you for your business!</p>
      <p>Best regards,<br/>Websensial.ai Team</p>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Invoice #${invoiceNumber} from Websensial.ai`,
    html,
  })
}

export async function sendQuotationEmail(
  customerEmail: string,
  quotationNumber: string,
  quotationUrl: string,
  expiresAt: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Quotation #${quotationNumber}</h2>
      <p>Dear Customer,</p>
      <p>We're excited to share our quotation with you!</p>
      <p><strong>Quotation Number:</strong> ${quotationNumber}</p>
      <p><strong>Valid Until:</strong> ${expiresAt}</p>
      <p><a href="${quotationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Quotation</a></p>
      <hr />
      <p>If you have any questions, feel free to reach out!</p>
      <p>Best regards,<br/>Websensial.ai Team</p>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Quotation #${quotationNumber} from Websensial.ai`,
    html,
  })
}

export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Websensial.ai! 🎉</h2>
      <p>Dear ${customerName},</p>
      <p>Welcome to Websensial.ai - Your AI Sales Automation Platform!</p>
      <p>We're thrilled to have you on board. With Websensial.ai, you can:</p>
      <ul>
        <li>Automate customer conversations on WhatsApp</li>
        <li>Generate AI-powered responses with custom tones</li>
        <li>Manage leads and track sales pipeline</li>
        <li>Create quotations and invoices automatically</li>
      </ul>
      <p><a href="https://your-domain.com/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p>
      <hr />
      <p>If you need any help, don't hesitate to contact us!</p>
      <p>Best regards,<br/>Websensial.ai Team</p>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: 'Welcome to Websensial.ai!',
    html,
  })
}
