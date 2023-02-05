import AndroidConnection from './AndroidConnection'
import type { BaseConnectorConfig } from './BaseConnector'
import BaseConnector from './BaseConnector'
import { isRemoteFunctionResponse } from './RemoteFunctionResponse'

export interface AndroidConnectorConfig extends BaseConnectorConfig {
  readonly rpcURL?: URL
  readonly userURL?: URL
}

export default class AndroidConnector extends BaseConnector {
  protected readonly rpcURL: URL
  protected readonly userURL: URL

  constructor(config: Readonly<AndroidConnectorConfig>) {
    super(config)
    this.rpcURL = config.rpcURL ?? new URL('https://peregrine/__rpc__/')
    this.userURL = config.userURL ?? new URL('https://peregrine/__user__/')
  }

  createConnection(): AndroidConnection {
    return new AndroidConnection({
      rpcURL: this.rpcURL,
      context: this.context,
      onReceive: data => {
        if (isRemoteFunctionResponse(data)) {
          this.handleRemoteFunctionResponse(data)
        } else {
          this.handleRemoteObservableEvent(data)
        }
      },
    })
  }

  async url(path: string): Promise<URL> {
    return new URL(path, this.userURL)
  }
}
