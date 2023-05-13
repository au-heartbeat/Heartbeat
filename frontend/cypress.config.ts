import { defineConfig } from 'cypress'

console.log('-----------------:', process.env.APP_ORIGIN)

export default defineConfig({
  videoCompression: 15,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.env.url = process.env.APP_ORIGIN || 'http://localhost:4321'
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./cypress/plugins/updateConfigJson.ts')(on, config)
      return config
    },
  },
})
