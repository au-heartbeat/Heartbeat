import { HttpClient } from '@src/clients/Httpclient'
import { DecryptDTO } from '@src/clients/security/dto/request'

export class DecryptedClient extends HttpClient {
  configData = ''

  decrypted = async (params: DecryptDTO) => {
    const result = await this.axiosInstance.post('/decrypt', params)
    this.configData = result.data.configData
    return this.configData
  }
}

export const decryptedClient = new DecryptedClient()
