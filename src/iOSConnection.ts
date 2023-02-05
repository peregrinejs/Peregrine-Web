import { ErrorMessages } from './Client'
import type { ReceivableData, SendableData } from './Connection'
import type Connection from './Connection'
import type Data from './Data'
import type RemoteFunctionRequest from './RemoteFunctionRequest'
import Deferred from './lib/Deferred'
import assert from './lib/assert'
import isNonNull from './lib/isNonNull'
import { log } from './lib/log'

export interface iOSConnectionOptions {
  readonly rpcURL: URL
  readonly context: Window
  readonly onReceive: (data: ReceivableData) => void
}

export default class iOSConnection implements Connection {
  protected rpcURL: URL
  protected context: Window
  protected onReceive: (data: ReceivableData) => void

  protected source: EventSource | null = null
  protected connected: Deferred<void> | null = null

  constructor({ rpcURL, context, onReceive }: iOSConnectionOptions) {
    this.rpcURL = rpcURL
    this.context = context
    this.onReceive = onReceive
  }

  async connect(): Promise<void> {
    log.debug('Attempting to connect...')

    const connection = new Deferred<void>()
    const subscribeURL = new URL('subscribe', this.rpcURL)
    const source = new EventSource(subscribeURL)

    this.source = source
    this.connected = connection

    source.onopen = () => {
      connection.resolve()
    }

    source.onmessage = (event: MessageEvent<string>) => {
      const data = event.data
      const index = data.indexOf('$')
      const observable = data.substring(0, index + 1)
      const message = data.substring(index + 1)

      this.receive({
        observable,
        data: message ? JSON.parse(message) : null,
      })
    }

    source.onerror = event => {
      log.error(`Received 'error' from event source (event: %O)`, event)
    }

    await connection.promise

    log.debug('Connection established!')
  }

  async disconnect(): Promise<void> {
    this.source?.close()
    this.source = null
    this.connected = null

    log.debug('Disconnected.')
  }

  send(data: SendableData): void {
    assert(isNonNull(this.source), ErrorMessages.NOT_CONNECTED)
    this.sendRemoteFunctionRequest(data)
  }

  receive(data: ReceivableData): void {
    this.onReceive(data)
  }

  private async sendRemoteFunctionRequest(
    request: RemoteFunctionRequest,
  ): Promise<void> {
    const invokeURL = new URL(`invoke/${request.function}`, this.rpcURL)

    try {
      const response = await this.context.fetch(invokeURL.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: this.convertDataToArrayBuffer(request.data),
      })

      if (response.ok) {
        const data = await this.getDataFromFetchResponse(response)

        this.receive({
          id: request.id,
          status: 'success',
          data,
        })
      } else {
        const error = await response.json()

        this.receive({
          id: request.id,
          status: 'error',
          error,
        })
      }
    } catch (error) {
      this.receive({
        id: request.id,
        status: 'error',
        error: { message: String(error), code: null },
      })
    }
  }

  private convertDataToArrayBuffer(data: Data): ArrayBuffer {
    const encoder = new TextEncoder()
    const buffer =
      typeof data === 'string'
        ? encoder.encode(data).buffer
        : typeof data === 'object'
        ? encoder.encode(JSON.stringify(data)).buffer
        : data

    return buffer
  }

  private getDataFromFetchResponse(response: Response): Promise<Data> {
    const contentType =
      response.headers.get('Content-Type') ?? 'application/octet-stream'
    const mimeType = contentType.split(';')[0]

    switch (mimeType) {
      case 'application/json':
        return response.json()
      case 'text/plain':
        return response.text()
      default:
        return response.arrayBuffer()
    }
  }
}
