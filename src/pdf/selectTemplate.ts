import InvoiceTemplate from '../components/InvoiceTemplate'
import ZeraInvoiceTemplate from '../components/ZeraInvoiceTemplate'

export function templateFor(companyId: 'zeraus'): typeof ZeraInvoiceTemplate
export function templateFor(
  companyId: string,
): typeof ZeraInvoiceTemplate | typeof InvoiceTemplate
export function templateFor(companyId: string) {
  return companyId === 'zeraus' ? ZeraInvoiceTemplate : InvoiceTemplate
}

export function invoiceFileName(invoice: any): string {
  const clientName = invoice.client?.client_name
    ? invoice.client.client_name.toLowerCase().split(' ').join('-')
    : 'invoice'
  return `${invoice.invoice_number}-${clientName}.pdf`
}
