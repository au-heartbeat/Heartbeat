import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { MOCK_GENERATE_REPORT_REQUEST_PARAMS, MOCK_REPORT_URL } from '../fixtures'
import { HttpStatusCode } from 'axios'
import { reportClient } from '@src/clients/ReportClient'
import { INTERNAL_SERVER_ERROR_MESSAGE } from '@src/constants'

const server = setupServer(rest.post(MOCK_REPORT_URL, (req, res, ctx) => res(ctx.status(HttpStatusCode.Ok))))

describe('report client', () => {
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('should get response when generate report request status 200', async () => {
    const result = await reportClient.reporting(MOCK_GENERATE_REPORT_REQUEST_PARAMS)

    expect(result.response).not.toBeNull()
  })

  it('should throw error when generate report response status 500', async () => {
    server.use(rest.post(MOCK_REPORT_URL, (req, res, ctx) => res(ctx.status(HttpStatusCode.InternalServerError))))

    await expect(async () => {
      await reportClient.reporting(MOCK_GENERATE_REPORT_REQUEST_PARAMS)
    }).rejects.toThrow(`report: ${INTERNAL_SERVER_ERROR_MESSAGE}`)
  })
})
