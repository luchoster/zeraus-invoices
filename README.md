# Invoices

## Rendering an invoice PDF from the command line

`scripts/render-invoice.tsx` renders a ZeraUS invoice to PDF in Node using the same
template components as the app (`src/pdf/selectTemplate.ts`).

```sh
pnpm render-invoice --id <_id> [--out /workspace/invoices]
pnpm render-invoice --number <invoice_number> [--out /workspace/invoices]
pnpm render-invoice --fixture path/to/invoice.json [--out ./out]
```

- Only the `zeraus` company/dataset is supported.
- `--id` / `--number` read the invoice (with its client) from Sanity using a read-only
  client. Set `SANITY_READ_TOKEN` in `.env.local` (gitignored) or in the environment;
  the script exits with an error if it is missing.
- `--fixture` skips Sanity and renders the given invoice JSON (same shape as the query
  result, with `client` expanded), which is handy for offline testing.
- `--out` defaults to `/workspace/invoices`. The PDF is written as
  `<invoice_number>-<client-slug>.pdf` and its absolute path is printed.
