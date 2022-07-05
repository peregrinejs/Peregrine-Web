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

import type AsyncIterableSubject from './AsyncIterableSubject'
import { ErrorMessages } from './Client'
import type Connection from './Connection'
import type Data from './Data'
import { isDataEmpty } from './Data'
import type RemoteFunctionRequest from './RemoteFunctionRequest'
import type RemoteFunctionResponse from './RemoteFunctionResponse'
import type RemoteObservableEvent from './RemoteObservableEvent'
import Deferred from './lib/Deferred'
import generateId from './lib/generateId'
import { log } from './lib/log'

export default abstract class Connector {
  abstract createConnection(context: Window): Connection
  abstract url(path: string): Promise<URL>

  protected connection: Connection | null = null
  protected events: AsyncIterableSubject<RemoteObservableEvent> | null = null

  protected readonly invocations: Map<
    string,
    Deferred<RemoteFunctionResponse>
  > = new Map()

  async connect(
    context: Window,
    events: AsyncIterableSubject<RemoteObservableEvent>,
  ): Promise<void> {
    const connection = this.createConnection(context)

    await connection.connect()

    this.events = events
    this.connection = connection
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      throw new Error(ErrorMessages.NOT_CONNECTED)
    }

    await this.connection.disconnect()
    this.connection = null
    this.events = null
  }

  async invoke(name: string, data: Data): Promise<RemoteFunctionResponse> {
    if (!this.connection) {
      throw new Error(ErrorMessages.NOT_CONNECTED)
    }

    const id = generateId()
    const request: RemoteFunctionRequest = { id, function: name, data }
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
    this.invocations.set(id, response)

    return response.promise
  }

  protected handleRemoteFunctionResponse = (
    response: RemoteFunctionResponse,
  ): void => {
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

  protected handleRemoteObservableEvent = (
    event: RemoteObservableEvent,
  ): void => {
    if (!this.events) {
      throw new Error(ErrorMessages.NOT_CONNECTED)
    }

    log.debug('⬇️ [evt: %s] (data: %o) 🟢', event.observable, event.data)

    this.events.next(event)
  }
}
