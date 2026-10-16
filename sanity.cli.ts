import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  app: {
    organizationId: 'ohYmxulGp',
    entry: './src/App.tsx'
  },
  deployment: {
    appId: 'zqc2xnyls02mbby2egsp9ir2'
  }
})
