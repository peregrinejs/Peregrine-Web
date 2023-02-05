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
