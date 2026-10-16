import {Suspense, useMemo, useState} from 'react'
import {useApplyDocumentActions, useQuery} from '@sanity/sdk-react'
import {createDocument, createDocumentHandle, publishDocument} from '@sanity/sdk'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Label,
  Portal,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui'
import {Plus, Trash2, X} from 'lucide-react'
import styled, {keyframes} from 'styled-components'
import {useCompany} from '../CompanyContext'

const uid = () => crypto.randomUUID()
const today = () => new Date().toISOString().slice(0, 10)
const plusDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 500;
`

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(560px, 100vw);
  z-index: 501;
  animation: ${slideIn} 0.22s ease-out;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.18);
`

interface ClientOption {
  _id: string
  _type: string
  client_name?: string
}

interface LoaderData {
  maxNumber: number | null
  clientType: string | null
  clients: ClientOption[]
}

interface ItemRow {
  _key: string
  description: string
  quantity: string
  price: string
}

const NEW_CLIENT = '__new__'

function DrawerForm({onClose}: {onClose: () => void}) {
  const company = useCompany()
  const apply = useApplyDocumentActions()
  const toast = useToast()

  const {data} = useQuery<LoaderData>({
    query: `{
      "maxNumber": *[_type == "invoices"] | order(invoice_number desc)[0].invoice_number,
      "clientType": *[_type == "invoices" && defined(clients)][0].clients->._type,
      "clients": *[_type == "invoices" && defined(clients)]{
        "_id": clients->_id,
        "_type": clients->_type,
        "client_name": clients->client_name
      }
    }`,
  })

  const clients = useMemo(() => {
    const seen = new Set<string>()
    const list: ClientOption[] = []
    for (const c of data?.clients ?? []) {
      if (!c?._id || seen.has(c._id)) continue
      seen.add(c._id)
      list.push(c)
    }
    return list.sort((a, b) => (a.client_name ?? '').localeCompare(b.client_name ?? ''))
  }, [data?.clients])

  const clientType = data?.clientType || clients[0]?._type || 'clients'
  const nextNumber = (data?.maxNumber ?? 0) + 1

  const [invoiceNumber, setInvoiceNumber] = useState(String(nextNumber))
  const [invoiceDate, setInvoiceDate] = useState(today())
  const [dueDate, setDueDate] = useState(plusDays(30))
  const [clientId, setClientId] = useState<string>(clients[0]?._id ?? NEW_CLIENT)
  const [status, setStatus] = useState('unpaid')
  const [tax, setTax] = useState('')
  const [items, setItems] = useState<ItemRow[]>([
    {_key: uid(), description: '', quantity: '1', price: ''},
  ])
  const [newClient, setNewClient] = useState({
    client_name: '',
    client_contact: '',
    client_email: '',
    client_phone: '',
    client_address_1: '',
    client_address_2: '',
    client_city: '',
    client_state: '',
    client_zip: '',
  })
  const [saving, setSaving] = useState(false)

  const isNewClient = clientId === NEW_CLIENT

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
    0,
  )
  const total = subtotal - (Number(tax) || 0)

  function updateItem(key: string, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it) => (it._key === key ? {...it, ...patch} : it)))
  }
  function addItem() {
    setItems((prev) => [...prev, {_key: uid(), description: '', quantity: '1', price: ''}])
  }
  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it._key !== key) : prev))
  }

  const validItems = items.filter((it) => it.description.trim() && Number(it.price) > 0)
  const canSubmit =
    !saving &&
    Number(invoiceNumber) > 0 &&
    invoiceDate &&
    dueDate &&
    validItems.length > 0 &&
    (isNewClient ? newClient.client_name.trim().length > 0 : Boolean(clientId))

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      const actions = []
      let clientRef: string

      if (isNewClient) {
        const newId = uid()
        const clientHandle = createDocumentHandle({documentId: newId, documentType: clientType})
        const clientData = Object.fromEntries(
          Object.entries(newClient).filter(([, v]) => v.trim()),
        )
        actions.push(createDocument(clientHandle, clientData as never))
        actions.push(publishDocument(clientHandle))
        clientRef = newId
      } else {
        clientRef = clientId.replace(/^drafts\./, '')
      }

      const invoiceId = uid()
      const invoiceHandle = createDocumentHandle({documentId: invoiceId, documentType: 'invoices'})
      actions.push(
        createDocument(invoiceHandle, {
          invoice_number: Number(invoiceNumber),
          invoice_date: invoiceDate,
          invoice_due_date: dueDate,
          payment_status: status,
          clients: {_type: 'reference', _ref: clientRef},
          invoiceItems: validItems.map((it) => ({
            _key: it._key,
            description: it.description.trim(),
            quantity: Number(it.quantity) || 0,
            price: Number(it.price) || 0,
          })),
          ...(Number(tax) > 0 ? {tax: Number(tax)} : {}),
        } as never),
      )
      actions.push(publishDocument(invoiceHandle))

      await apply(actions)
      toast.push({
        status: 'success',
        title: `Invoice #${invoiceNumber} created`,
        description: company.name,
      })
      onClose()
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'Failed to create invoice',
        description: err instanceof Error ? err.message : String(err),
      })
      setSaving(false)
    }
  }

  return (
    <Stack space={4} padding={4}>
      <Flex align="center" justify="space-between" gap={2}>
        <Box flex={1} style={{minWidth: 0}}>
          <Heading size={[1, 1, 2]}>New invoice — {company.name}</Heading>
        </Box>
        <Button mode="bleed" icon={X} onClick={onClose} aria-label="Close" />
      </Flex>

      <Grid columns={[1, 1, 2]} gap={3}>
        <Stack space={2}>
          <Label size={1}>Invoice #</Label>
          <TextInput
            type="number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
          />
        </Stack>
        <Stack space={2}>
          <Label size={1}>Payment status</Label>
          <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partially">Partial</option>
          </Select>
        </Stack>
        <Stack space={2}>
          <Label size={1}>Invoice date</Label>
          <TextInput
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.currentTarget.value)}
          />
        </Stack>
        <Stack space={2}>
          <Label size={1}>Due date</Label>
          <TextInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.currentTarget.value)}
          />
        </Stack>
      </Grid>

      <Stack space={2}>
        <Label size={1}>Client</Label>
        <Select value={clientId} onChange={(e) => setClientId(e.currentTarget.value)}>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.client_name || '(unnamed client)'}
            </option>
          ))}
          <option value={NEW_CLIENT}>+ New client…</option>
        </Select>
      </Stack>

      {isNewClient && (
        <Card padding={3} radius={2} border tone="transparent">
          <Stack space={3}>
            <Grid columns={[1, 1, 2]} gap={3}>
              <Stack space={2}>
                <Label size={1}>Name *</Label>
                <TextInput
                  value={newClient.client_name}
                  onChange={(e) => setNewClient({...newClient, client_name: e.currentTarget.value})}
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Contact</Label>
                <TextInput
                  value={newClient.client_contact}
                  onChange={(e) =>
                    setNewClient({...newClient, client_contact: e.currentTarget.value})
                  }
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Email</Label>
                <TextInput
                  type="email"
                  value={newClient.client_email}
                  onChange={(e) => setNewClient({...newClient, client_email: e.currentTarget.value})}
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Phone</Label>
                <TextInput
                  value={newClient.client_phone}
                  onChange={(e) => setNewClient({...newClient, client_phone: e.currentTarget.value})}
                />
              </Stack>
            </Grid>
            <Grid columns={[1, 1, 2]} gap={3}>
              <Stack space={2}>
                <Label size={1}>Address 1</Label>
                <TextInput
                  value={newClient.client_address_1}
                  onChange={(e) =>
                    setNewClient({...newClient, client_address_1: e.currentTarget.value})
                  }
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Address 2</Label>
                <TextInput
                  value={newClient.client_address_2}
                  onChange={(e) =>
                    setNewClient({...newClient, client_address_2: e.currentTarget.value})
                  }
                />
              </Stack>
            </Grid>
            <Grid columns={[1, 1, 3]} gap={3}>
              <Stack space={2}>
                <Label size={1}>City</Label>
                <TextInput
                  value={newClient.client_city}
                  onChange={(e) => setNewClient({...newClient, client_city: e.currentTarget.value})}
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>State</Label>
                <TextInput
                  value={newClient.client_state}
                  onChange={(e) => setNewClient({...newClient, client_state: e.currentTarget.value})}
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Zip</Label>
                <TextInput
                  value={newClient.client_zip}
                  onChange={(e) => setNewClient({...newClient, client_zip: e.currentTarget.value})}
                />
              </Stack>
            </Grid>
          </Stack>
        </Card>
      )}

      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Label size={1}>Line items</Label>
          <Button
            fontSize={1}
            mode="ghost"
            icon={Plus}
            text="Add item"
            onClick={addItem}
            padding={2}
          />
        </Flex>
        {items.map((it) => (
          <Flex key={it._key} direction={['column', 'column', 'row']} gap={2}>
            <Box flex={[0, 0, 6]}>
              <TextInput
                placeholder="Description"
                value={it.description}
                onChange={(e) => updateItem(it._key, {description: e.currentTarget.value})}
              />
            </Box>
            <Flex flex={[0, 0, 6]} align="center" gap={2}>
              <Box flex={2} style={{minWidth: 0}}>
                <TextInput
                  type="number"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => updateItem(it._key, {quantity: e.currentTarget.value})}
                />
              </Box>
              <Box flex={3} style={{minWidth: 0}}>
                <TextInput
                  type="number"
                  placeholder="Price"
                  value={it.price}
                  onChange={(e) => updateItem(it._key, {price: e.currentTarget.value})}
                />
              </Box>
              <Button
                mode="bleed"
                tone="critical"
                icon={Trash2}
                onClick={() => removeItem(it._key)}
                disabled={items.length === 1}
                aria-label="Remove item"
              />
            </Flex>
          </Flex>
        ))}
      </Stack>

      <Grid columns={[1, 1, 2]} gap={3}>
        <Stack space={2}>
          <Label size={1}>Tax</Label>
          <TextInput
            type="number"
            placeholder="0"
            value={tax}
            onChange={(e) => setTax(e.currentTarget.value)}
          />
        </Stack>
        <Flex align="flex-end" justify="flex-end">
          <Stack space={2} style={{textAlign: 'right'}}>
            <Text size={1} muted>
              Subtotal ${subtotal.toLocaleString()}
            </Text>
            <Heading size={2}>Total ${total.toLocaleString()}</Heading>
          </Stack>
        </Flex>
      </Grid>

      <Flex gap={3} justify="flex-end" wrap="wrap" paddingTop={2}>
        <Button mode="ghost" text="Cancel" onClick={onClose} disabled={saving} />
        <Button
          tone="primary"
          text={saving ? 'Creating…' : 'Create invoice'}
          onClick={handleSubmit}
          disabled={!canSubmit}
        />
      </Flex>
    </Stack>
  )
}

export default function CreateInvoiceButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        fontSize={1}
        tone="primary"
        icon={Plus}
        text="New Invoice"
        onClick={() => setOpen(true)}
      />
      {open && (
        <Portal>
          <Overlay onClick={() => setOpen(false)} />
          <Panel>
            <Card style={{height: '100%', overflowY: 'auto'}} shadow={2}>
              <Suspense
                fallback={
                  <Flex align="center" justify="center" style={{height: '100%'}}>
                    <Spinner muted />
                  </Flex>
                }
              >
                <DrawerForm onClose={() => setOpen(false)} />
              </Suspense>
            </Card>
          </Panel>
        </Portal>
      )}
    </>
  )
}
