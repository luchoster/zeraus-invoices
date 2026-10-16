import {Document, Image, Page, StyleSheet, Text, View, Svg, Path, Rect, Defs, RadialGradient, Stop, ClipPath, G} from '@react-pdf/renderer'
import {formatMoney} from '../pdf/formatMoney'

// Colors from the template
const DARK = '#46515B'
const TEXT = '#0D0D0D'
const WHITE = '#FFFFFF'
const LIGHT_BORDER = '#D1D5DB'

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 50,
    paddingBottom: 40,
    color: TEXT,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
  },
  invoiceTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 2,
  },
  // Client & Invoice Details
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  invoiceToSection: {
    flex: 1,
  },
  invoiceToLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  clientDetail: {
    fontSize: 10,
    color: '#444',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  invoiceMetaSection: {
    alignItems: 'flex-end',
  },
  invoiceMeta: {
    fontSize: 10,
    color: '#444',
    marginBottom: 4,
    textAlign: 'right',
  },
  // DUE box
  dueBox: {
    backgroundColor: DARK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    borderRadius: 2,
  },
  dueText: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textAlign: 'center',
  },
  // Divider line between DUE box and invoice meta
  dividerLine: {
    width: 30,
    height: 3,
    backgroundColor: DARK,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  // Table
  table: {
    marginTop: 30,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    color: WHITE,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'center',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
  },
  // Totals section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 10,
    color: '#444',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  totalsContainer: {
    width: 220,
  },
  totalsDivider: {
    height: 2,
    backgroundColor: DARK,
    marginBottom: 14,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#444',
  },
  totalsValue: {
    fontSize: 10,
    color: TEXT,
    textAlign: 'right',
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DARK,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    borderRadius: 2,
  },
  totalFinalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#e15d55',
  },
  totalFinalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
})

// WB Logo as inline SVG for @react-pdf/renderer
function WBLogo() {
  return (
    <Svg width="120" height="30" viewBox="0 0 673 163">
      <Path
        d="M299.22 25.5627H308.528L292.509 76H282.696L270.141 38.9838L257.513 76H247.7L231.682 25.5627H240.99L252.751 62.5068L265.306 25.5627H274.975L287.531 62.5068L299.22 25.5627ZM340.526 25.5627L360.658 76H351.277L346.731 64.6715H322.126L317.58 76H308.128L328.332 25.5627H340.526ZM325.517 56.2292H343.34L334.393 33.9329L325.517 56.2292ZM402.783 58.6825L415.771 76H404.804L393.187 60.4142H377.962V76H368.653V25.5627H395.135C404.876 25.5627 412.813 33.4278 412.813 43.0246C412.813 49.9516 408.7 55.8684 402.783 58.6825ZM394.846 51.4668C399.608 51.4668 403.505 47.7147 403.505 43.0246C403.505 38.3344 399.608 34.5101 394.846 34.5101H377.962V51.4668H394.846ZM458.592 58.6825L471.58 76H460.612L448.995 60.4142H433.77V76H424.462V25.5627H450.943C460.684 25.5627 468.621 33.4278 468.621 43.0246C468.621 49.9516 464.509 55.8684 458.592 58.6825ZM450.655 51.4668C455.417 51.4668 459.313 47.7147 459.313 43.0246C459.313 38.3344 455.417 34.5101 450.655 34.5101H433.77V51.4668H450.655ZM521.544 34.2215H490.228V46.4159H516.132V55.1468H490.228V67.2691H521.544V76H480.92V25.5627H521.544V34.2215ZM579.358 25.5627V76H572.575L542.774 41.365V76H533.466V25.5627H540.249L570.05 60.1256V25.5627H579.358Z"
        fill="#0D0D0D"
      />
      <Path
        d="M273.821 116.796C276.563 118.095 281.83 122.063 281.83 128.918C281.83 136.856 275.408 143.35 267.471 143.35H236.949V92.9123H266.1C273.676 92.9123 279.81 99.0456 279.81 106.622C279.81 111.889 275.913 115.497 273.821 116.796ZM270.213 107.344C270.213 104.024 267.543 101.355 264.224 101.355H245.968V113.26H264.224C267.543 113.26 270.213 110.663 270.213 107.344ZM265.739 134.907C269.491 134.907 272.522 131.877 272.522 128.125C272.522 124.372 269.491 121.414 265.739 121.414H245.968V134.907H265.739ZM330.846 92.9123H340.082V121.125C340.082 134.114 329.475 144.721 316.414 144.721C303.354 144.721 292.747 134.114 292.747 121.125V92.9123H302.055V121.125C302.055 128.99 308.477 135.412 316.414 135.412C324.352 135.412 330.846 128.99 330.846 121.125V92.9123ZM387.351 126.032L400.34 143.35H389.372L377.755 127.764H362.53V143.35H353.222V92.9123H379.703C389.444 92.9123 397.381 100.777 397.381 110.374C397.381 117.301 393.268 123.218 387.351 126.032ZM379.414 118.816C384.177 118.816 388.073 115.064 388.073 110.374C388.073 105.684 384.177 101.86 379.414 101.86H362.53V118.816H379.414ZM443.16 126.032L456.148 143.35H445.18L433.563 127.764H418.338V143.35H409.03V92.9123H435.511C445.252 92.9123 453.19 100.777 453.19 110.374C453.19 117.301 449.077 123.218 443.16 126.032ZM435.223 118.816C439.985 118.816 443.881 115.064 443.881 110.374C443.881 105.684 439.985 101.86 435.223 101.86H418.338V118.816H435.223ZM487.848 91.5414C502.495 91.5414 514.473 103.447 514.473 118.095C514.473 132.743 502.495 144.721 487.848 144.721C473.2 144.721 461.294 132.743 461.294 118.095C461.294 103.447 473.2 91.5414 487.848 91.5414ZM487.848 135.412C497.372 135.412 505.165 127.62 505.165 118.095C505.165 108.57 497.372 100.777 487.848 100.777C478.323 100.777 470.602 108.57 470.602 118.095C470.602 127.62 478.323 135.412 487.848 135.412ZM584.815 92.9123H594.123L578.105 143.35H568.291L555.736 106.333L543.109 143.35H533.296L517.277 92.9123H526.585L538.346 129.856L550.902 92.9123H560.571L573.126 129.856L584.815 92.9123ZM623.24 113.982C631.754 116.652 641.423 119.971 641.423 129.568C641.423 140.752 630.888 144.432 619.992 144.432C612.56 144.432 605.994 142.7 599.356 138.876L604.046 131.444C609.169 134.258 614.942 136.062 620.353 136.062C627.28 136.062 631.754 134.258 631.754 130.073C631.754 125.455 625.621 123.723 618.91 121.631C610.179 118.961 600.366 115.93 600.366 105.756C600.366 101.715 602.098 98.3241 605.417 95.8707C609.025 93.2731 614.364 91.9021 620.931 91.9021C627.785 91.9021 633.774 93.6339 640.413 97.4582L635.867 104.674C630.672 101.788 625.837 100.2 620.498 100.2C613.426 100.2 610.035 102.365 610.035 105.395C610.035 110.158 616.313 111.817 623.24 113.982Z"
        fill="#0D0D0D"
      />
      <G clipPath="url(#clip0)">
        <Path
          d="M195.652 120.024C189.532 146.701 174.151 153.692 146.788 153.496L103.946 153.471L118.049 105.362C82.9959 105.055 -3.97416 88.7975 0.146903 9.00098L195.652 120.024Z"
          fill="#0D0D0D"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="195.652" height="144.507" fill="white" x="0" y="9" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

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

export default function InvoiceTemplate({invoice}: {invoice: InvoiceData}) {
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
      <Page size="LETTER" style={styles.page}>
        {/* Header: Logo + INVOICE */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <WBLogo />
          </View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Client Info + Invoice Meta */}
        <View style={styles.detailsRow}>
          <View style={styles.invoiceToSection}>
            <Text style={styles.invoiceToLabel}>Invoice to :</Text>
            {invoice.client?.client_name && (
              <Text style={styles.clientName}>{invoice.client.client_name}</Text>
            )}
            {invoice.client?.client_contact && (
              <Text style={styles.clientDetail}>{invoice.client.client_contact}</Text>
            )}
            {invoice.client?.client_phone && (
              <Text style={styles.clientDetail}>{invoice.client.client_phone}</Text>
            )}
            {invoice.client?.client_email && (
              <Text style={styles.clientDetail}>{invoice.client.client_email}</Text>
            )}
          </View>

          <View style={styles.invoiceMetaSection}>
            <Text style={styles.invoiceMeta}>Invoice No : {invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>Date : {invoice.invoice_date}</Text>
            <View style={styles.dividerLine} />
            <View style={styles.dueBox}>
              <Text style={styles.dueText}>DUE : ${formatMoney(total)}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {/* Table Rows */}
          {invoice.invoiceItems?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>${formatMoney(item.price)}</Text>
              <Text style={styles.colTotal}>
                ${formatMoney(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer: Company Info + Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Warren Burrows</Text>
            <Text style={styles.companyDetail}>7265 Dean Martin Dr. #100</Text>
            <Text style={styles.companyDetail}>Las Vegas, NV 89118</Text>
            <Text style={{...styles.companyDetail, marginTop: 6}}>(702) 350-1098</Text>
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalsDivider} />
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sub-total :</Text>
              <Text style={styles.totalsValue}>${formatMoney(subTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax :</Text>
              <Text style={styles.totalsValue}>${formatMoney(tax)}</Text>
            </View>
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total :</Text>
              <Text style={styles.totalFinalValue}>${formatMoney(total)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
