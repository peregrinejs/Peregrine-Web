import { ErrorMessages } from './Client'
import type Connection from './Connection'
import type Connector from './Connector'
import { isDataEmpty } from './Data'
import type RemoteFunctionRequest from './RemoteFunctionRequest'
import type RemoteFunctionResponse from './RemoteFunctionResponse'
import type RemoteObservableEvent from './RemoteObservableEvent'
import type AsyncIterableSubject from './lib/AsyncIterableSubject'
import Deferred from './lib/Deferred'
import assert from './lib/assert'
import isNonNull from './lib/isNonNull'
import { log } from './lib/log'

export interface BaseConnectorConfig {
  readonly context: Window
  readonly events: AsyncIterableSubject<RemoteObservableEvent>
}

export default abstract class BaseConnector implements Connector {
  abstract createConnection(): Connection
  abstract url(path: string): Promise<URL>

  protected readonly context: Window
  protected readonly events: AsyncIterableSubject<RemoteObservableEvent>
  protected connection: Connection | null = null

  protected readonly invocations: Map<
    string,
    Deferred<RemoteFunctionResponse>
  > = new Map()

  constructor(config: BaseConnectorConfig) {
    this.context = config.context
    this.events = config.events
  }

  async connect(): Promise<void> {
    const connection = this.createConnection()
    await connection.connect()
    this.connection = connection
  }

  async disconnect(): Promise<void> {
    assert(isNonNull(this.connection), ErrorMessages.NOT_CONNECTED)
    await this.connection.disconnect()
    this.connection = null
  }

  async invoke(
    request: RemoteFunctionRequest,
  ): Promise<RemoteFunctionResponse> {
    assert(isNonNull(this.connection), ErrorMessages.NOT_CONNECTED)
    const response = new Deferred<RemoteFunctionResponse>()

    if (isDataEmpty(request.data)) {
      log.debug('⬆️ [req: %s] %s()', request.id, request.function)
    } else {
      log.debug(
        '⬆️ [req: %s] %s(%o)',
        request.id,
        request.function,
        request.data,
      )
    }

    this.connection.send(request)
    this.invocations.set(request.id, response)

    return response.promise
  }

  protected handleRemoteFunctionResponse(
    response: RemoteFunctionResponse,
  ): void {
    if ('data' in response) {
      if (isDataEmpty(response.data)) {
        log.debug('⬇️ [res: %s] 🟢', response.id)
      } else {
        log.debug('⬇️ [res: %s] (data: %o) 🟢', response.id, response.data)
      }
    } else {
      log.debug('⬇️ [res: %s] (error: %o) 🔴', response.id, response.error)
    }

    const invocation = this.invocations.get(response.id)

    if (!invocation) {
      log.debug(
        '⬇️ [res: %s] !!! could not find invocation !!! 🔴',
        response.id,
      )
      return
    }

    invocation.resolve(response)
  }

  protected handleRemoteObservableEvent(event: RemoteObservableEvent): void {
    log.debug('⬇️ [evt: %s] (data: %o) 🟢', event.observable, event.data)
    this.events.next(event)
  }
}
