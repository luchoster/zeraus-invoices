import {memo, Suspense} from 'react'
import {useQuery} from '@sanity/sdk-react'
import {Box, Card, Flex, Grid, Heading, Text, Spinner} from '@sanity/ui'
import UpdatePaymentStatus from './components/UpdatePaymentStatus'
import GenerateInvoicePDF from './components/GenerateInvoicePdf'
import {SendEmail} from './components/SendEmail'
import CreateInvoiceButton from './components/CreateInvoice'

interface Props {
  currentYear: number
}

const InvoiceRow = memo(function InvoiceRow({invoice, index}: {invoice: any; index: number}) {
  let totalQty = 0
  let totalDue = 0
  invoice.invoiceItems?.forEach((item: any) => {
    totalQty += item.quantity
    totalDue += item.price * item.quantity
  })

  return (
    <Card
      padding={4}
      radius={2}
      shadow={1}
      tone={index % 2 === 0 ? 'transparent' : 'primary'}
    >
      <Grid columns={[8]} gap={1}>
        <Flex align="center" justify="center">
          <Text size={1}>{invoice.invoice_number}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <Text size={1}>{invoice.invoice_date}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <Text size={1}>{invoice.invoice_due_date}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <Text size={1}>{invoice.client?.client_name}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <Text size={1}>{totalQty}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <Text size={1}>$ {totalDue.toLocaleString()}</Text>
        </Flex>
        <Flex align="center" justify="center">
          <UpdatePaymentStatus
            documentId={invoice._id}
            paymentStatus={invoice.payment_status}
          />
        </Flex>
        <Flex align="center" justify="center" gap={2}>
          <GenerateInvoicePDF invoice={invoice} />
          <SendEmail invoice={invoice} />
        </Flex>
      </Grid>
    </Card>
  )
})

export default function InvoicesList({currentYear}: Props) {
  const {data: invoices} = useQuery<any[]>({
    query: `*[_type == "invoices" && invoice_date >= $startDate && invoice_due_date <= $endDate] | order(invoice_number desc) {
      ...,
      "client": clients->
    }`,
    params: {
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
    },
  })

  let totalIncome = 0
  invoices?.forEach((inv: any) => {
    if (inv.payment_status === 'paid') {
      inv.invoiceItems?.forEach((item: any) => {
        totalIncome += item.price * item.quantity
      })
    }
  })

  return (
    <>
      <Flex align="center" justify="space-between" gap={3} paddingBottom={4}>
        <CreateInvoiceButton />
        <Flex align="center" gap={3}>
          <Text size={1} muted style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Total</Text>
          <Heading size={3}>${totalIncome.toLocaleString()}</Heading>
        </Flex>
      </Flex>

      {(!invoices || invoices.length === 0) && (
        <Card padding={5} radius={2} shadow={1}>
          <Flex align="center" justify="center">
            <Text muted>No invoices found for {currentYear}</Text>
          </Flex>
        </Card>
      )}

      {invoices && invoices.length > 0 && (
        <Box>
          <Card padding={4} radius={2} shadow={1} tone="inherit">
            <Grid columns={[8]} gap={1}>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Invoice #</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Invoice Date</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Due Date</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Client Name</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Hrs / Qty</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Rate / Price</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Payment Status</Text>
              </Flex>
              <Flex align="center" justify="center">
                <Text size={1} weight="bold">Generate Invoice</Text>
              </Flex>
            </Grid>
          </Card>

          {invoices.map((invoice: any, index: number) => (
            <Suspense key={invoice._id} fallback={<Card padding={4}><Spinner /></Card>}>
              <InvoiceRow invoice={invoice} index={index} />
            </Suspense>
          ))}
        </Box>
      )}
    </>
  )
}
