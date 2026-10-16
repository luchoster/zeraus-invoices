import { defineConfig } from 'sanity'

export default defineConfig({
  name: 'ZERAUS Invoices',
  projectId: 'b80qy5y0',
  dataset: 'zeraus',

  // Load environment variables
  env: {
    development: {
      api: {
        projectId: 'b80qy5y0',
        dataset: 'zeraus',
      },
    },
  },
})
