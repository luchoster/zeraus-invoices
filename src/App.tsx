import {useState} from 'react'
import {SanityApp, type SanityConfig} from '@sanity/sdk-react'
import {ThemeProvider, ToastProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import {companies, type CompanyId} from './companyConfig'
import {CompanyProvider} from './CompanyContext'
import InvoicesDashboard from './InvoicesDashboard'
import './App.css'

const theme = buildTheme()

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  borderRadius: 4,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#666',
}

export default function App() {
  const [companyId, setCompanyId] = useState<CompanyId>('zeraus')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const company = companies[companyId]

  const years: number[] = []
  for (let y = 2020; y <= new Date().getFullYear(); y++) {
    years.push(y)
  }

  const config: SanityConfig[] = [
    {
      projectId: company.projectId,
      dataset: company.dataset,
    },
  ]

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <div style={{padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <label style={labelStyle}>Company</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value as CompanyId)}
              style={selectStyle}
            >
              {Object.values(companies).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <label style={labelStyle}>Year</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              style={selectStyle}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SanityApp key={companyId} config={config} fallback={<div className="loading">Loading...</div>}>
          <CompanyProvider company={company}>
            <InvoicesDashboard currentYear={currentYear} />
          </CompanyProvider>
        </SanityApp>
      </ToastProvider>
    </ThemeProvider>
  )
}
