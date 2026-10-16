import {createContext, useContext} from 'react'
import type {CompanyConfig} from './companyConfig'

const CompanyContext = createContext<CompanyConfig | null>(null)

export function CompanyProvider({
  company,
  children,
}: {
  company: CompanyConfig
  children: React.ReactNode
}) {
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}

export function useCompany(): CompanyConfig {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider')
  return ctx
}
