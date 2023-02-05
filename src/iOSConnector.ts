import type { BaseConnectorConfig } from './BaseConnector'
import BaseConnector from './BaseConnector'
import { isRemoteFunctionResponse } from './RemoteFunctionResponse'
import iOSConnection from './iOSConnection'

export interface iOSConnectorConfig extends BaseConnectorConfig {
  readonly rpcURL?: URL
  readonly userURL?: URL
}

export default class iOSConnector extends BaseConnector {
  protected readonly rpcURL: URL
  protected readonly userURL: URL

  constructor(config: Readonly<iOSConnectorConfig>) {
    super(config)
    this.rpcURL = config.rpcURL ?? new URL('peregrine:///__rpc__/')
    this.userURL = config.userURL ?? new URL('peregrine:///__user__/')
  }

  createConnection(): iOSConnection {
    return new iOSConnection({
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
