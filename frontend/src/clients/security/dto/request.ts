export interface EncryptDTO {
  configData: string
  password: string
}

export interface DecryptDTO {
  encryptedData: string
  password: string
}
