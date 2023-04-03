export class UnknownException extends Error {
  constructor() {
    super()
    throw new Error('Unknown')
  }
}
