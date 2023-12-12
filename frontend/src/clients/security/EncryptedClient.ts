import { HttpClient } from '@src/clients/Httpclient'
import { EncryptDTO } from '@src/clients/security/dto/request'

export class EncryptedClient extends HttpClient {
  downloadFile = ''

  encrypted = async (params: EncryptDTO) => {
    await this.axiosInstance
      .post(`/encrypt`, params)
      .then((res) => {
        this.downloadFile = res.data.encryptedData
      })
      .catch((e) => {
        throw e
      })
    return this.downloadFile
  }
}

export const encryptedClient = new EncryptedClient()
