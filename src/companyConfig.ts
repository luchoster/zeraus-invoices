export type CompanyId = 'zeraus' | 'warren-burrows'

export interface CompanyConfig {
  id: CompanyId
  name: string
  projectId: string
  dataset: string
}

export const companies: Record<CompanyId, CompanyConfig> = {
  zeraus: {
    id: 'zeraus',
    name: 'ZeraUS',
    projectId: 'b80qy5y0',
    dataset: 'zeraus',
  },
  'warren-burrows': {
    id: 'warren-burrows',
    name: 'Warren Burrows',
    projectId: 'b80qy5y0',
    dataset: 'warren-burrows',
  },
}
