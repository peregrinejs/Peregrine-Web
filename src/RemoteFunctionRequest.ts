import type Data from './Data'

export const isRemoteFunctionRequest = (
  obj: any,
): obj is RemoteFunctionRequest => obj?.id && obj?.function

export default interface RemoteFunctionRequest {
  readonly id: string
  readonly function: string
  readonly data: Data
}
