import {useMemo, useState} from 'react'
import {useEditDocument} from '@sanity/sdk-react'
import {createDocumentHandle} from '@sanity/sdk'
import {Select} from '@sanity/ui'

interface Props {
  documentId: string
  paymentStatus: string
}

export default function UpdatePaymentStatus({documentId, paymentStatus}: Props) {
  const [status, setStatus] = useState(paymentStatus)
  const handle = useMemo(
    () => createDocumentHandle({documentId, documentType: 'invoices', liveEdit: true}),
    [documentId],
  )
  const editStatus = useEditDocument({...handle, path: 'payment_status'})

  function update(val: string) {
    setStatus(val)
    editStatus(val)
  }

  return (
    <Select
      fontSize={1}
      value={status}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update(e.currentTarget.value)}
      disabled={status === 'paid'}
    >
      <option value="unpaid">Unpaid</option>
      <option value="paid">Paid</option>
      <option value="partially">Partial</option>
    </Select>
  )
}
