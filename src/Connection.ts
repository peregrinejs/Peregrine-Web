import type RemoteFunctionRequest from './RemoteFunctionRequest'
import type RemoteFunctionResponse from './RemoteFunctionResponse'
import type RemoteObservableEvent from './RemoteObservableEvent'

export type SendableData = RemoteFunctionRequest
export type ReceivableData = RemoteFunctionResponse | RemoteObservableEvent

export default interface Connection {
  /**
   * Connect to the remote interface.
   */
  connect(): Promise<void>

  /**
   * Disconnect from the remote interface.
   */
  disconnect(): Promise<void>

  /**
   * Send data to the remote interface.
   *
   * @param data - The data to send.
   */
  send(data: SendableData): void

  /**
   * Receive data from the remote interface.
   *
   * @param data - The received data.
   */
  receive(data: ReceivableData): void
}
