// Peregrine for Web: native container for hybrid apps
// Copyright (C) 2022 Caracal LLC
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License version 3 as published
// by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License version 3
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import type Client from './Client'
import { ErrorMessages } from './Client'
import ClientError from './ClientError'
import type Connector from './Connector'
import type Data from './Data'
import type RemoteObservableEvent from './RemoteObservableEvent'
import AsyncIterableSubject from './lib/AsyncIterableSubject'
import Deferred from './lib/Deferred'
import assert from './lib/assert'
import isNonNull from './lib/isNonNull'
import platform from './lib/platform'

export type RemoteFunction<I, O> = (arg: I) => Promise<O>
export type RemoteObservable<T> = AsyncGenerator<T>
export type RemoteInterface = Record<
  string,
  RemoteFunction<any, any> | AsyncGenerator<any>
>

export type RemoteFunctions<T extends RemoteInterface> = {
  [K in keyof T]: T[K] extends RemoteFunction<any, any> ? T[K] : never
}

export default class StringClient<T extends RemoteInterface> implements Client {
  private _connector: Deferred<Connector> | null = null
  private _events: AsyncIterableSubject<RemoteObservableEvent> =
    new AsyncIterableSubject()
  private _endpointCache: Map<
    string,
    RemoteFunction<unknown, unknown> | RemoteObservable<unknown>
  > = new Map()

  async connect(context: Window): Promise<void> {
    this._connector = new Deferred()
    const connector = await this._loadConnector()
    await connector.connect(context, this._events)
    this._connector.resolve(connector)
  }

  async disconnect(): Promise<void> {
    assert(isNonNull(this._connector), ErrorMessages.NOT_CONNECTED)
    const connector = await this._connector.promise
    await connector.disconnect()
    this._connector = null
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
   * observable. Subsequent calls with the same name will return the same
   * reference.
   *
   * @param name - The name of the remote function or observable.
   */
  get<N extends keyof T>(name: N): T[N] {
    // FIXME: Using `keyof` makes `name` a string, number, or symbol despite
    // specifying a constraint in `RemoteInterface`.
    const _name = name as string

    let endpoint = this._endpointCache.get(_name)

    if (!endpoint) {
      if (_name.endsWith('$')) {
        const { _events } = this
        endpoint = (async function* () {
          for await (const event of _events) {
            if (_name === event.observable) {
              yield event.data
            }
          }
        })()
      } else {
        endpoint = async data => {
          assert(isNonNull(this._connector), ErrorMessages.NOT_CONNECTED)
          const connector = await this._connector.promise
          // FIXME: `data` should be validated
          const response = await connector.invoke(_name, data as Data)

          if (response.status === 'error') {
            throw ClientError.fromRemoteFunctionError(response.error)
          }

          return response.data
        }
      }

      this._endpointCache.set(_name, endpoint)
    }

    return endpoint as T[N]
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

    if (typeof fn !== 'function') {
      throw new Error(ErrorMessages.BAD_INVOCATION)
    }

    return fn(arg) as ReturnType<RemoteFunctions<T>[N]>
  }

  private async _loadConnector(): Promise<Connector> {
    if (platform === 'android') {
      const { default: AndroidConnector } = await import('./AndroidConnector')
      return new AndroidConnector()
    } else if (platform === 'ios') {
      const { default: iOSConnector } = await import('./iOSConnector')
      return new iOSConnector()
    }

    throw new Error(ErrorMessages.UNKNOWN_PLATFORM)
  }
}
