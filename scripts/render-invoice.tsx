/** @jsxRuntime automatic */
/**
 * Render a ZeraUS invoice PDF in Node using the same template components as the app.
 *
 *   pnpm render-invoice (--id <_id> | --number <n> | --fixture <path.json>) [--out <dir>]
 *
 * Read-only: fetches a single invoice from Sanity (or a local JSON fixture) and
 * writes the PDF to <out>/<invoiceFileName>.
 */
import fs from 'node:fs'
import Module, {register} from 'node:module'
import path from 'node:path'
import {parseArgs} from 'node:util'

const ROOT = path.resolve(__dirname, '..')
const ASSETS = path.join(ROOT, 'src/assets/zeraus')
const COMPANY_ID = 'zeraus'
const DEFAULT_OUT = '/workspace/invoices'
const QUERY = `*[_type=="invoices" && (_id==$id || invoice_number==$n)][0]{..., "client": clients->}`

function fail(message: string): never {
  console.error(`render-invoice: ${message}`)
  process.exit(1)
}

// The templates `import x from '*.png'` (resolved by Vite in the app). In Node, make
// those imports resolve to the absolute file path so the modules can load.
function installPngLoader() {
  const extensions = (Module as any)._extensions as Record<string, Function>
  extensions['.png'] = (mod: any, filename: string) => {
    mod.exports = {__esModule: true, default: filename}
  }
  register(
    'data:text/javascript,' +
      encodeURIComponent(`
        import {fileURLToPath} from 'node:url'
        export async function load(url, context, next) {
          if (url.endsWith('.png')) {
            return {format: 'module', shortCircuit: true, source: 'export default ' + JSON.stringify(fileURLToPath(url))}
          }
          return next(url, context)
        }
      `),
  )
}

function readToken(): string | undefined {
  if (process.env.SANITY_READ_TOKEN) return process.env.SANITY_READ_TOKEN
  const envFile = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envFile)) return undefined
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?SANITY_READ_TOKEN\s*=\s*(.*)\s*$/)
    if (match) return match[1].replace(/^(['"])(.*)\1$/, '$2') || undefined
  }
  return undefined
}

async function fetchInvoice(id: string | undefined, number: number | undefined) {
  const token = readToken()
  if (!token) {
    fail('SANITY_READ_TOKEN is not set. Add it to .env.local or export it in the environment.')
  }

  const {createClient} = await import('@sanity/client')
  const {companies} = await import('../src/companyConfig')
  const company = companies[COMPANY_ID]
  const client = createClient({
    projectId: company.projectId,
    dataset: company.dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
  })

  const invoice = await client.fetch(QUERY, {id: id ?? null, n: number ?? null})
  if (!invoice) fail(`no invoice found for ${id ? `id "${id}"` : `number ${number}`}`)
  return invoice
}

async function main() {
  const {values} = parseArgs({
    options: {
      id: {type: 'string'},
      number: {type: 'string'},
      fixture: {type: 'string'},
      out: {type: 'string', default: DEFAULT_OUT},
    },
  })

  const sources = [values.id, values.number, values.fixture].filter((v) => v !== undefined)
  if (sources.length !== 1) {
    fail(
      'usage: pnpm render-invoice (--id <_id> | --number <n> | --fixture <path.json>) [--out <dir>]',
    )
  }

  let number: number | undefined
  if (values.number !== undefined) {
    number = Number(values.number)
    if (!Number.isFinite(number)) fail(`invalid --number "${values.number}"`)
  }

  const invoice = values.fixture
    ? JSON.parse(fs.readFileSync(path.resolve(values.fixture), 'utf8'))
    : await fetchInvoice(values.id, number)

  installPngLoader()
  const {renderToFile} = await import('@react-pdf/renderer')
  const {invoiceFileName, templateFor} = await import('../src/pdf/selectTemplate')

  const Template = templateFor(COMPANY_ID)
  const images = {
    logo: path.join(ASSETS, 'logo-black.png'),
    icon: path.join(ASSETS, 'invoice-icon-black.png'),
  }

  const outDir = path.resolve(values.out!)
  fs.mkdirSync(outDir, {recursive: true})
  const outFile = path.join(outDir, invoiceFileName(invoice))

  await renderToFile(<Template invoice={invoice} images={images} />, outFile)
  console.log(outFile)
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)))
