import {useCallback, useState} from 'react'
import {useClient} from '@sanity/sdk-react'
import {pdf} from '@react-pdf/renderer'
import {
  Button,
  Dialog,
  Box,
  Stack,
  TextInput,
  Text,
  Card,
  Flex,
  useToast,
  Label,
  Spinner,
} from '@sanity/ui'
import {Mail, Send} from 'lucide-react'
import {useCompany} from '../CompanyContext'
import InvoiceTemplate from './InvoiceTemplate'
import ZeraInvoiceTemplate from './ZeraInvoiceTemplate'

interface Props {
  invoice: any
}

export function SendEmail({invoice}: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(invoice.client?.client_email || '')
  const [sending, setSending] = useState(false)
  const toast = useToast()
  const company = useCompany()
  const Template = company.id === 'zeraus' ? ZeraInvoiceTemplate : InvoiceTemplate
  const client = useClient({apiVersion: '2025-01-01'})

  const onClose = useCallback(() => {
    setOpen(false)
    setSending(false)
  }, [])

  async function handleSend() {
    if (!email) {
      toast.push({status: 'warning', title: 'Please enter an email address'})
      return
    }

    setSending(true)

    try {
      const blob = await pdf(<Template invoice={invoice} />).toBlob()

      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const clientName = invoice.client?.client_name
        ? invoice.client.client_name.toLowerCase().split(' ').join('-')
        : 'invoice'
      const filename = `${invoice.invoice_number}-${clientName}.pdf`

      await client
        .patch(invoice._id)
        .set({
          email_request: {
            _type: 'object',
            to: email,
            pdf_base64: base64,
            filename,
            company: company.id,
            requested_at: new Date().toISOString(),
          },
        })
        .commit()

      toast.push({
        status: 'success',
        title: `Invoice queued for delivery to ${email}`,
      })
      onClose()
    } catch (err: any) {
      toast.push({
        status: 'error',
        title: 'Error queuing email',
        description: err.message,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button
        fontSize={1}
        mode="ghost"
        tone="default"
        icon={Mail}
        text="Send"
        onClick={() => setOpen(true)}
      />

      {open && (
        <Dialog
          header="Send Invoice"
          id="send-email-dialog"
          onClose={onClose}
          zOffset={1000}
          width={1}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Card padding={3} radius={2} tone="primary" border>
                <Flex align="center" gap={3}>
                  <Text size={1} muted>
                    Sending Invoice #{invoice.invoice_number}
                    {invoice.client?.client_name && ` for ${invoice.client.client_name}`}
                  </Text>
                </Flex>
              </Card>

              <Stack space={2}>
                <Label size={1}>Recipient Email</Label>
                <TextInput
                  fontSize={2}
                  padding={3}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  type="email"
                />
              </Stack>

              <Flex gap={3} justify="flex-end">
                <Button fontSize={1} mode="ghost" text="Cancel" onClick={onClose} />
                <Button
                  fontSize={1}
                  tone="primary"
                  icon={sending ? Spinner : Send}
                  text={sending ? 'Sending...' : 'Send Invoice'}
                  onClick={handleSend}
                  disabled={sending || !email}
                />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </>
  )
}
