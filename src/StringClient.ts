import type Client from './Client'
import { ErrorMessages } from './Client'
import ClientError from './ClientError'
import type Connector from './Connector'
import type Data from './Data'
import type RemoteObservableEvent from './RemoteObservableEvent'
import AsyncIterableSubject from './lib/AsyncIterableSubject'
import Deferred from './lib/Deferred'
import { detectPlatform } from './lib/Platform'
import assert from './lib/assert'
import generateId from './lib/generateId'
import isNonNull from './lib/isNonNull'

export type RemoteFunction<I, O> = (arg: I) => Promise<O>
export type RemoteObservable<T> = AsyncIterable<T>
export type RemoteInterface = Record<
  string,
  RemoteFunction<any, any> | RemoteObservable<any>
>

export type RemoteFunctions<T extends RemoteInterface> = {
  [K in keyof T]: T[K] extends RemoteFunction<any, any> ? T[K] : never
}

export interface StringClientConfig {
  readonly connector?: Connector
  readonly events?: AsyncIterableSubject<RemoteObservableEvent>
}

export default class StringClient<T extends RemoteInterface> implements Client {
  private readonly _options: StringClientConfig

  private readonly _functionCache: Map<
    string,
    RemoteFunction<unknown, unknown>
  > = new Map()

  private readonly _observableCache: Map<string, AsyncIterableSubject<any>[]> =
    new Map()

  private _connector: Deferred<Connector> | null = null
  private _context: Window | null = null
  private _events: AsyncIterableSubject<RemoteObservableEvent>

  constructor(config: StringClientConfig = {}) {
    this._options = config
    this._events = config.events ?? new AsyncIterableSubject()
    this._subscribeToEvents()
  }

  async connect(context?: Window): Promise<void> {
    this._connector = new Deferred()
    this._context = context ?? null
    const connector = await this._loadConnector()
    await connector.connect()
    this._connector.resolve(connector)
  }

  async disconnect(): Promise<void> {
    assert(isNonNull(this._connector), ErrorMessages.NOT_CONNECTED)
    const connector = await this._connector.promise
    await connector.disconnect()
    this._connector = null
    this._context = null
  }

  async url(path: string): Promise<URL> {
    assert(isNonNull(this._connector), ErrorMessages.NOT_CONNECTED)
    const connector = await this._connector.promise
    return await connector.url(path.replace(/^\/+/, ''))
  }

  /**
   * Get a remote interface endpoint by name.
   *
   * This will return a handle to either a remote function or remote
   * observable.
   *
   * @param name - The name of the remote function or observable.
   */
  get<N extends keyof T>(name: N): T[N] {
    assert(typeof name === 'string', ErrorMessages.BAD_ENDPOINT_NAME)

    if (name.endsWith('$')) {
      const observables = this._observableCache.get(name) ?? []
      const ob = new AsyncIterableSubject()

      this._observableCache.set(name, [ob, ...observables])

      return ob as unknown as T[N]
    } else {
      let fn = this._functionCache.get(name)

      if (!fn) {
        fn = async data => {
          assert(isNonNull(this._connector), ErrorMessages.NOT_CONNECTED)
          const connector = await this._connector.promise
          const response = await connector.invoke({
            id: generateId(),
            function: name,
            data: data as Data, // FIXME: `data` should be validated
          })

          if (response.status === 'error') {
            throw ClientError.fromRemoteFunctionError(response.error)
          }

          return response.data
        }

        this._functionCache.set(name, fn)
      }

      return fn as T[N]
    }
  }

  /**
   * Invoke a remote function by name.
   *
   * @param name - The name of the remote function.
   * @param arg - The argument of the remote function, if any.
   */
  invoke<N extends keyof RemoteFunctions<T>>(
    name: N,
    arg?: Parameters<RemoteFunctions<T>[N]>[0],
  ): ReturnType<RemoteFunctions<T>[N]> {
    const fn = this.get(name)
    assert(typeof fn === 'function', ErrorMessages.BAD_INVOCATION)
    return fn(arg) as ReturnType<RemoteFunctions<T>[N]>
  }

  private async _subscribeToEvents(): Promise<void> {
    for await (const event of this._events) {
      const observables = this._observableCache.get(event.observable) ?? []

      for (const ob of observables) {
        ob.next(event.data)
      }
    }
  }

  private async _loadConnector(): Promise<Connector> {
    if (this._options.connector) {
      return this._options.connector
    }

    assert(isNonNull(this._context), ErrorMessages.NOT_CONNECTED)

    const platform = detectPlatform(this._context)

    if (platform === 'android') {
      const { default: AndroidConnector } = await import('./AndroidConnector')
      return new AndroidConnector({
        context: this._context,
        events: this._events,
      })
    } else if (platform === 'ios') {
      const { default: iOSConnector } = await import('./iOSConnector')
      return new iOSConnector({
        context: this._context,
        events: this._events,
      })
    }

    throw new Error(ErrorMessages.UNKNOWN_PLATFORM)
  }
}
