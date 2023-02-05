import type RemoteFunctionRequest from './RemoteFunctionRequest'
import type RemoteFunctionResponse from './RemoteFunctionResponse'

export default interface Connector {
  connect(): Promise<void>
  disconnect(): Promise<void>
  invoke(request: RemoteFunctionRequest): Promise<RemoteFunctionResponse>
  url(path: string): Promise<URL>
}
