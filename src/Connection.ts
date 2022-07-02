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
