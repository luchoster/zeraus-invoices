import {Document, Image, Page, StyleSheet, Text, View} from '@react-pdf/renderer'

import BlackIcon from '../assets/zeraus/invoice-icon-black.png'
import BlackLogo from '../assets/zeraus/logo-black.png'

const DARK = '#191919'
const ACCENT = '#874da2'
const RED = '#e15d55'

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  companyLogo: {
    left: 10,
    padding: 10,
    position: 'absolute',
    textAlign: 'left',
    top: 10,
    width: 150,
  },
  invoiceIcon: {
    borderLeft: `1px solid ${DARK}`,
    borderBottom: `1px solid ${DARK}`,
    right: 0,
    padding: 0,
    position: 'absolute',
    height: 96,
    width: 96,
  },
  invoiceLogoImg: {
    right: 16,
    padding: 10,
    position: 'absolute',
    textAlign: 'left',
    top: 16,
    height: 60,
  },
  invoiceContainer: {
    backgroundColor: '#fff',
    borderRight: `1px solid ${DARK}`,
    borderTop: `1px solid ${DARK}`,
    height: '100%',
    margin: '95px 95px 0 0',
    padding: 20,
    paddingBottom: 25,
  },
  invoiceContainerDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  },
  invoiceDate: {
    color: DARK,
    flexDirection: 'column',
  },
  businessInfo: {
    color: DARK,
    flexDirection: 'column',
  },
  invoiceDetails: {
    padding: '30px 0',
  },
  invoiceDetailsHeading: {
    alignItems: 'center',
    borderBottom: `2px solid ${ACCENT}`,
    color: RED,
    flexDirection: 'row',
    fontSize: 14,
    fontWeight: 600,
    justifyContent: 'space-around',
    padding: '10px 0',
    textAlign: 'center',
    textTransform: 'uppercase',
    width: '100%',
  },
  invoiceDetailsContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    columnGap: 5,
    flexWrap: 'wrap',
    flexBasis: 'auto',
    padding: '30px 0',
  },
  invoiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '20px 0',
  },
  desc: {
    flexDirection: 'column',
    fontSize: 12,
    flex: '1 0 35%',
  },
  col: {
    flexDirection: 'column',
    flex: '1 0 20%',
    fontSize: 12,
    paddingBottom: 10,
    textAlign: 'center',
  },
  colDesc: {
    flexDirection: 'column',
    flex: '1 0 33%',
    fontSize: 12,
    paddingBottom: 10,
    textAlign: 'center',
    width: 500,
  },
  invoiceTotals: {
    alignItems: 'center',
    borderTop: `1px solid ${DARK}`,
    flexDirection: 'row',
    fontSize: 24,
    justifyContent: 'flex-end',
    paddingTop: 40,
    textDecoration: 'underline',
  },
  companyInfo: {
    bottom: 50,
    left: 20,
    position: 'absolute',
  },
  dateText: {
    fontSize: 10,
    marginBottom: 3,
  },
  clientText: {
    fontSize: 10,
    marginBottom: 2,
  },
  companyInfoText: {
    fontSize: 9,
    marginBottom: 2,
    color: '#444',
  },
})

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

interface Client {
  client_name?: string
  client_contact?: string
  client_email?: string
  client_phone?: string
  client_address_1?: string
  client_address_2?: string
  client_city?: string
  client_state?: string
  client_zip?: string
}

interface InvoiceData {
  invoice_number: number
  invoice_date: string
  invoice_due_date: string
  invoiceItems: InvoiceItem[]
  client: Client
  tax?: number
}

export default function ZeraInvoiceTemplate({invoice}: {invoice: InvoiceData}) {
  let subTotal = 0
  if (invoice.invoiceItems) {
    invoice.invoiceItems.forEach((item) => {
      subTotal += item.price * item.quantity
    })
  }
  const tax = invoice.tax ?? 0
  const total = subTotal - tax

  return (
    <Document>
      <Page size="LETTER">
        <View style={styles.background}>
          <View fixed>
            <View>
              <Image style={styles.companyLogo} src={BlackLogo} />
            </View>
            <View style={styles.invoiceIcon}>
              <Image style={styles.invoiceLogoImg} src={BlackIcon} />
            </View>
          </View>
          <View style={styles.invoiceContainer}>
            <View style={styles.invoiceContainerDetails}>
              <View style={styles.invoiceDate}>
                <Text style={styles.dateText}>Invoice No: {invoice.invoice_number}</Text>
                <Text style={styles.dateText}>Date: {invoice.invoice_date}</Text>
                <Text style={styles.dateText}>Due Date: {invoice.invoice_due_date}</Text>
              </View>
              <View style={styles.businessInfo}>
                {invoice.client?.client_name && (
                  <Text style={styles.clientText}>{invoice.client.client_name}</Text>
                )}
                {invoice.client?.client_contact && (
                  <Text style={styles.clientText}>{invoice.client.client_contact}</Text>
                )}
                {invoice.client?.client_address_1 && (
                  <Text style={styles.clientText}>{invoice.client.client_address_1}</Text>
                )}
                {invoice.client?.client_address_2 && (
                  <Text style={styles.clientText}>{invoice.client.client_address_2}</Text>
                )}
                {invoice.client?.client_city && (
                  <Text style={styles.clientText}>
                    {invoice.client.client_city}, {invoice.client.client_state}{' '}
                    {invoice.client.client_zip}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.invoiceDetails}>
              <View style={styles.invoiceDetailsHeading}>
                <View style={styles.colDesc}>
                  <Text>Description</Text>
                </View>
                <View style={styles.col}>
                  <Text>Hrs / Qty</Text>
                </View>
                <View style={styles.col}>
                  <Text>Rate / Price</Text>
                </View>
                <View style={styles.col}>
                  <Text>Total</Text>
                </View>
              </View>
              <View style={styles.invoiceDetailsContent}>
                {invoice.invoiceItems?.map((item, index) => (
                  <View key={index} style={styles.invoiceRow}>
                    <View style={styles.desc}>
                      <Text>{item.description}</Text>
                    </View>
                    <View style={styles.col}>
                      <Text>{item.quantity}</Text>
                    </View>
                    <View style={styles.col}>
                      <Text>$ {item.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.col}>
                      <Text>${(item.price * item.quantity).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.invoiceTotals}>
                <Text>Total Due: ${total.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyInfoText}>ZERA US LLC</Text>
              <Text style={styles.companyInfoText}>7655 Lone Shepherd Dr.</Text>
              <Text style={styles.companyInfoText}>Las Vegas, NV 89166</Text>
              <Text style={styles.companyInfoText}>(702) 350-1098</Text>
              <Text style={styles.companyInfoText}>contact@zera.us</Text>
              <Text style={styles.companyInfoText}>https://zera.us</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
