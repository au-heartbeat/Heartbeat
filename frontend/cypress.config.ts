import { defineConfig } from 'cypress'

export default defineConfig({
  videoCompression: 15,
  e2e: {
    setupNodeEvents(on, config) {
      config.env.url = process.env.APP_ORIGIN || 'http://localhost:4321'
      require('./cypress/plugins/updateConfigJson.ts')(on, config)
      return config
    },
    chromeWebSecurity: false,
  },
})
