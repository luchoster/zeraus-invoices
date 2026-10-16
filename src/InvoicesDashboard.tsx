import {Suspense} from 'react'
import {Box, Flex, Spinner} from '@sanity/ui'
import InvoicesList from './InvoicesList'

interface Props {
  currentYear: number
}

export default function InvoicesDashboard({currentYear}: Props) {
  return (
    <Box padding={4} sizing="border" style={{height: '100%', overflow: 'auto'}}>
      <Suspense
        fallback={
          <Flex align="center" justify="center" padding={6}>
            <Spinner muted />
          </Flex>
        }
      >
        <InvoicesList currentYear={currentYear} />
      </Suspense>
    </Box>
  )
}
