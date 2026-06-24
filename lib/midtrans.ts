import midtransClient from 'midtrans-client'

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export interface InvoicePayload {
  id: string
  amount: number
  customerName: string
  customerEmail?: string
  items: { name: string; price: number; quantity: number }[]
}

export async function createPaymentLink(invoice: InvoicePayload) {
  const parameter = {
    transaction_details: {
      order_id: `INV-${invoice.id}-${Date.now()}`,
      gross_amount: invoice.amount,
    },
    customer_details: {
      first_name: invoice.customerName,
      email: invoice.customerEmail || '',
    },
    item_details: invoice.items.map(i => ({
      id: i.name.toLowerCase().replace(/\s/g, '-'),
      price: i.price,
      quantity: i.quantity,
      name: i.name,
    })),
  }
  const transaction = await snap.createTransaction(parameter)
  return {
    paymentUrl: transaction.redirect_url,
    token: transaction.token,
    orderId: parameter.transaction_details.order_id,
  }
}

export async function checkPaymentStatus(orderId: string) {
  const status = await coreApi.transaction.status(orderId)
  const paid = ['capture', 'settlement'].includes(status.transaction_status)
  return {
    status: paid ? 'paid' : status.transaction_status === 'expire' ? 'expired' : status.transaction_status === 'cancel' ? 'failed' : 'pending',
    paidAt: paid ? new Date(status.settlement_time || status.transaction_time) : undefined,
    raw: status,
  }
}
