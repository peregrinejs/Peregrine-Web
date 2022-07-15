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
