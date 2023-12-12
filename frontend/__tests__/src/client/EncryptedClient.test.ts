import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { encryptedClient } from '@src/clients/security/EncryptedClient'
import { BASE_URL } from '../fixtures'
import { HttpStatusCode } from 'axios'

describe('get encryptedData', () => {
  const params = {
    configData:
      '{"projectName":"Heartbeat Metrics2023","dateRange":{"startDate":"2023-11-01T00:00:00.000+08:00","endDate":"2023-11-14T23:59:59.999+08:00"},"calendarType":"Calendar with Chinese Holiday","metrics":["Velocity","Cycle time","Classification","Lead time for changes","Deployment frequency","Change failure rate","Mean time to recovery"],"board":{"type":"Jira","boardId":"2","email":"xinyi.wang1@thoughtworks.com","projectKey":"ADM","site":"dorametrics","token":""},"pipelineTool":{"type":"BuildKite","token":""},"sourceControl":{"type":"GitHub","token":""}}',
    password: '123abc',
  }
  const encryptedUrl = `${BASE_URL}/encrypt`
  const server = setupServer(
    rest.post(encryptedUrl, (req, res, ctx) => {
      return res(ctx.status(HttpStatusCode.Ok))
    })
  )
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('should return encryptedData when encryptedData status 200', async () => {
    const result = await encryptedClient.encrypted(params)

    expect(result).not.toEqual(null)
  })

  it('should throw error when encryptedData status is 500', async () => {
    server.use(
      rest.post(encryptedUrl, (req, res, ctx) =>
        res(ctx.status(HttpStatusCode.InternalServerError), ctx.json({ hintInfo: 'Encrypt or decrypt process failed' }))
      )
    )
    await expect(() => encryptedClient.encrypted(params)).rejects.toThrow('Encrypt or decrypt process failed')
  })
})
