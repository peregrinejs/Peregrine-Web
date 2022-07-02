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
import type { ReceivableData, SendableData } from './Connection'
import type Connection from './Connection'
import Deferred from './lib/Deferred'
import { log } from './lib/log'

export interface AndroidConnectionOptions {
  readonly rpcURL: URL
  readonly context: Window
  readonly onReceive: (data: ReceivableData) => void
}

export default class AndroidConnection implements Connection {
  protected rpcURL: URL
  protected context: Window
  protected onReceive: (data: ReceivableData) => void

  protected port: MessagePort | null = null
  protected connected: Deferred<void> | null = null

  constructor({ rpcURL, context, onReceive }: AndroidConnectionOptions) {
    this.rpcURL = rpcURL
    this.context = context
    this.onReceive = onReceive
  }

  async connect(): Promise<void> {
    log.debug('Attempting to connect...')

    const connected = new Deferred<void>()

    this.context.addEventListener('message', this.handleContextMessage)
    this.context.addEventListener(
      'messageerror',
      this.handleContextMessageError,
    )

    this.connected = connected

    const subscribeURL = new URL('subscribe', this.rpcURL)
    const response = await this.context.fetch(subscribeURL.toString())

    log.debug('Initiating subscription...')

    if (!response.ok) {
      throw new Error('Error occurred while subscribing.')
    }

    await connected.promise

    log.debug('Connection established!')
  }

  async disconnect(): Promise<void> {
    this.context.removeEventListener('message', this.handleContextMessage)
    this.context.removeEventListener(
      'messageerror',
      this.handleContextMessageError,
    )

    this.port?.removeEventListener('message', this.handlePortMessage)
    this.port?.removeEventListener('messageerror', this.handlePortMessageError)
    this.port = null
    this.connected = null

    log.debug('Disconnected.')
  }

  send(data: SendableData): void {
    if (!this.port) {
      throw new Error(ErrorMessages.NOT_CONNECTED)
    }

    if (data instanceof ArrayBuffer) {
      throw new Error('Binary data is not supported on Android.')
    }

    this.port.postMessage(JSON.stringify(data))
  }

  receive(data: ReceivableData): void {
    this.onReceive(data)
  }

  private handleContextMessage = (event: MessageEvent<unknown>): void => {
    if (event.data !== 'peregrine:connect') {
      log.debug(
        `Received 'message' from context with unexpected data (event.data = %O)`,
        event.data,
      )

      return
    }

    if (!this.connected) {
      log.error(
        `Received 'message' from context before a connection was attempted (event.data = %O)`,
        event.data,
      )

      return
    }

    const [port] = event.ports

    // Can't use `addEventListener()` for some reason.
    port.onmessage = this.handlePortMessage
    port.onmessageerror = this.handlePortMessageError

    this.context.removeEventListener('message', this.handleContextMessage)
    this.context.removeEventListener(
      'messageerror',
      this.handleContextMessageError,
    )

    this.port = port
    this.connected.resolve()
    this.connected = null
  }

  private handleContextMessageError = (event: MessageEvent<unknown>): void => {
    log.error(`Received 'messageerror' from context (event: %O)`, event)

    this.connected?.reject(new Error('Could not connect to message port.'))
  }

  private handlePortMessage = (event: MessageEvent<string>): void => {
    this.receive(JSON.parse(event.data))
  }

  private handlePortMessageError = (event: MessageEvent<unknown>): void => {
    log.error(`Received 'messageerror' from message port (event: %O)`, event)
  }
}
