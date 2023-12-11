import { HttpClient } from '@src/clients/Httpclient'

export interface EncryptDTO {
  configData: string
  password: string
}

export class EncryptedClient extends HttpClient {
  downloadFile: object = null

  encrypted = async (params: EncryptDTO) => {
    await this.axiosInstance
      .post(`/encrypt`, params, {})
      .then((res) => {
        this.downloadFile = res.data
      })
      .catch((e) => {
        throw e
      })
    return {
      response: this.downloadFile,
    }
  }
}

export const encryptedClient = new EncryptedClient()
