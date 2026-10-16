import {documentEventHandler} from '@sanity/functions'
import {createClient} from '@sanity/client'
import {Resend} from 'resend'

const companyEmails: Record<string, {from: string; name: string; html: (invoiceNumber: string) => string}> = {
  zeraus: {
    from: 'ZeraUS <invoices@emails.zeraus.com>',
    name: 'ZeraUS',
    html: (invoiceNumber: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Invoice #${invoiceNumber}</h2>
        <p>Please find your invoice attached.</p>
        <p style="margin-top: 24px; color: #666;">
          ZeraUS<br/>
          zeraus.com
        </p>
      </div>
    `,
  },
  'warren-burrows': {
    from: 'Warren Burrows <invoices@emails.warrenburrows.com>',
    name: 'Warren Burrows',
    html: (invoiceNumber: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #46515B;">Invoice #${invoiceNumber}</h2>
        <p>Please find your invoice attached.</p>
        <p style="margin-top: 24px; color: #666;">
          Warren Burrows<br/>
          7265 Dean Martin Dr. #100<br/>
          Las Vegas, NV 89118<br/>
          (702) 350-1098
        </p>
      </div>
    `,
  },
}

const resendApiKeys: Record<string, string> = {
  zeraus: 'SANITY_STUDIO_RESEND_API_KEY_ZERA',
  'warren-burrows': 'SANITY_STUDIO_RESEND_API_KEY_WB',
}

export const handler = documentEventHandler(async ({context, event}) => {
  const {data} = event

  if (!data?.email_request) {
    console.log('No email_request found, skipping.')
    return
  }

  const {to, pdf_base64, filename, company, requested_at} = data.email_request
  const companyId = company || 'warren-burrows'
  const envVar = resendApiKeys[companyId] || 'RESEND_API_KEY_WARREN_BURROWS'
  const apiKey = process.env[envVar]

  if (!apiKey) {
    console.error(`${envVar} environment variable is not set.`)
    return
  }

  const emailConfig = companyEmails[companyId] || companyEmails['warren-burrows']
  const resend = new Resend(apiKey)
  const client = createClient({
    ...context.clientOptions,
    apiVersion: '2025-01-01',
  })

  console.log(`[${emailConfig.name}] Sending invoice #${data.invoice_number} to ${to} (requested at ${requested_at})`)

  try {
    const result = await resend.emails.send({
      from: emailConfig.from,
      to: [to],
      subject: `Invoice #${data.invoice_number} from ${emailConfig.name}`,
      html: emailConfig.html(data.invoice_number),
      attachments: pdf_base64
        ? [
            {
              filename: filename || `invoice-${data.invoice_number}.pdf`,
              content: pdf_base64,
            },
          ]
        : undefined,
    })

    console.log('Email sent successfully:', result)

    await client
      .patch(data._id)
      .set({
        email_sent: {
          to,
          sent_at: new Date().toISOString(),
        },
      })
      .unset(['email_request'])
      .commit()

    console.log('Cleared email_request and set email_sent on document', data._id)
  } catch (err) {
    console.error('Failed to send email:', err)
  }
})
