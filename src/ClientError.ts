import type { RemoteFunctionError } from './RemoteFunctionResponse'

export default class ClientError extends Error {
  static fromRemoteFunctionError(error: RemoteFunctionError): ClientError {
    return new ClientError(error.message, error.code)
  }

  constructor(
    override readonly message: string,
    readonly code: string | null = null,
  ) {
    super(message)
  }
}
