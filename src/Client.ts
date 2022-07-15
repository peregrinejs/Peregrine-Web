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

export const ErrorMessages = {
  NOT_CONNECTED: 'Client is not connected.',
  BAD_ENDPOINT_NAME: 'Endpoint name is invalid.',
  BAD_INVOCATION: 'Bad remote function invocation.',
  UNKNOWN_PLATFORM: 'Unknown platform.',
}

export default interface Client {
  /**
   * Connect this client to the global JS context and native context.
   *
   * This method "activates" this Peregrine client by subscribing to native
   * plugin events which will propagate through observables.
   *
   * @param context - The [global object](https://developer.mozilla.org/en-US/docs/Glossary/Global_object): `window`, `self`, or `globalThis`.
   *
   * @returns - A promise that resolves when the client has connected.
   */
  connect(context?: Window): Promise<void>

  /**
   * Disconnect this client from the global JS context and native context.
   *
   * @returns - A promise that resolves when the client has disconnected.
   */
  disconnect(): Promise<void>

  /**
   * Get a URL to a file within the native context by its path.
   *
   * @param path - The path to the file.
   */
  url(path: string): Promise<URL>
}
