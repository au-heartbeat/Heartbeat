import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { BASE_URL } from '../fixtures'
import { HttpStatusCode } from 'axios'
import { decryptedClient } from '@src/clients/security/DecryptedClient'

describe('DecryptedClient', () => {
  const server = setupServer()
  const decryptedUrl = `${BASE_URL}/decrypt`
  const request = { encryptedData: '5fff61e21d8a0987b0255058pv8YNHkVApLI99InkLqoZX', password: '123abc' }
  const response = { configData: '{"test": "test"}' }

  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('should return decrypted data when calling encrypted api given status 200', async () => {
    server.use(
      rest.post(decryptedUrl, (req, res, ctx) => {
        return res(ctx.status(HttpStatusCode.Ok), ctx.json(response))
      })
    )

    const result = await decryptedClient.decrypted(request)

    expect(result).toEqual(response.configData)
  })

  it('should throw error when encryptedData status is Non-200', async () => {
    server.use(
      rest.post(decryptedUrl, (req, res, ctx) =>
        res(ctx.status(HttpStatusCode.InternalServerError), ctx.json({ hintInfo: 'Encrypt or decrypt process failed' }))
      )
    )
    await expect(() => decryptedClient.decrypted(request)).rejects.toThrow('Encrypt or decrypt process failed')
  })
})
