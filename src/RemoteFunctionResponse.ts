import type Data from './Data'

export const isRemoteFunctionResponse = (
  obj: any,
): obj is RemoteFunctionResponse => obj?.id && obj?.status

export interface RemoteFunctionError {
  readonly message: string
  readonly code: string | null
}

type RemoteFunctionResponse =
  | {
      readonly id: string
      readonly status: 'success'
      readonly data: Data
    }
  | {
      readonly id: string
      readonly status: 'error'
      readonly error: RemoteFunctionError
    }

export default RemoteFunctionResponse
