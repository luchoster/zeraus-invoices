import {useState} from 'react'
import {PDFDownloadLink} from '@react-pdf/renderer'
import {Button, Spinner} from '@sanity/ui'
import {Download} from 'lucide-react'
import {useCompany} from '../CompanyContext'
import InvoiceTemplate from './InvoiceTemplate'
import ZeraInvoiceTemplate from './ZeraInvoiceTemplate'

interface Props {
  invoice: any
}

export default function GenerateInvoicePDF({invoice}: Props) {
  const company = useCompany()
  const [ready, setReady] = useState(false)

  const clientName = invoice.client?.client_name
    ? invoice.client.client_name.toLowerCase().split(' ').join('-')
    : 'invoice'
  const fileName = `${invoice.invoice_number}-${clientName}.pdf`

  if (!ready) {
    return (
      <Button
        fontSize={1}
        mode="ghost"
        tone="primary"
        icon={Download}
        text="PDF"
        onClick={() => setReady(true)}
      />
    )
  }

  const Template = company.id === 'zeraus' ? ZeraInvoiceTemplate : InvoiceTemplate

  return (
    <PDFDownloadLink document={<Template invoice={invoice} />} fileName={fileName}>
      {({loading}) =>
        loading ? (
          <Button fontSize={1} mode="ghost" tone="primary" disabled>
            <Spinner />
          </Button>
        ) : (
          <Button fontSize={1} mode="ghost" tone="positive" icon={Download} text="Download" />
        )
      }
    </PDFDownloadLink>
  )
}
