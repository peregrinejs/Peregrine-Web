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

import { ErrorMessages } from './Client'
import type Connector from './Connector'
import type RemoteFunctionRequest from './RemoteFunctionRequest'
import type RemoteFunctionResponse from './RemoteFunctionResponse'
import type RemoteObservableEvent from './RemoteObservableEvent'
import type { RemoteFunction, RemoteObservable } from './StringClient'
import type AsyncIterableSubject from './lib/AsyncIterableSubject'
import assert from './lib/assert'

export type LocalConnectorInterface = Record<
  string,
  RemoteFunction<any, any> | (() => RemoteObservable<any>)
>

export interface LocalConnectorConfig<T extends LocalConnectorInterface> {
  readonly interface: T
  readonly events: AsyncIterableSubject<RemoteObservableEvent>
}

export default class LocalConnector<T extends LocalConnectorInterface>
  implements Connector
{
  protected readonly interface: T
  protected readonly events: AsyncIterableSubject<RemoteObservableEvent>
  protected connected = false

  constructor(config: LocalConnectorConfig<T>) {
    this.interface = config.interface
    this.events = config.events
  }

  async connect(): Promise<void> {
    for (const [name, endpoint] of Object.entries(this.interface)) {
      if (name.endsWith('$')) {
        this.subscribeToObservable(
          name,
          endpoint as () => RemoteObservable<any>,
        )
      }
    }

    this.connected = true
  }

  async disconnect(): Promise<void> {
    // TODO: cancel async iterators
    this.connected = false
  }

  async invoke(
    request: RemoteFunctionRequest,
  ): Promise<RemoteFunctionResponse> {
    assert(this.connected, ErrorMessages.NOT_CONNECTED)
    const fn = this.interface[request.function]
    assert(typeof fn === 'function', ErrorMessages.BAD_INVOCATION)

    try {
      const data = await fn(request.data)

      return {
        id: request.id,
        status: 'success',
        data,
      }
    } catch (e) {
      return {
        id: request.id,
        status: 'error',
        error: {
          message: e instanceof Error ? e.message : String(e),
          code: null,
        },
      }
    }
  }

  async url(path: string): Promise<URL> {
    return new URL(path)
  }

  private async subscribeToObservable(
    name: string,
    observable: () => RemoteObservable<any>,
  ): Promise<void> {
    for await (const data of observable()) {
      const event: RemoteObservableEvent = {
        observable: name,
        data,
      }

      this.events.next(event)
    }
  }
}
