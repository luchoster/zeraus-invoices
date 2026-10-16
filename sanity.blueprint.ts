import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'send-invoice-email',
      event: {
        on: ['create', 'update'],
        filter: '_type == "invoices" && defined(email_request)',
        projection: '{_id, invoice_number, email_request}',
      },
    }),
  ],
})
