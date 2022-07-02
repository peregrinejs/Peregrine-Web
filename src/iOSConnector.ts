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

import Connector from './Connector'
import { isRemoteFunctionResponse } from './RemoteFunctionResponse'
import iOSConnection from './iOSConnection'

export interface iOSConnectorConfig {
  rpcURL?: URL
  userURL?: URL
}

export default class iOSConnector extends Connector {
  protected readonly config: Required<Readonly<iOSConnectorConfig>>

  constructor(config: Readonly<iOSConnectorConfig> = {}) {
    super()
    this.config = {
      rpcURL: new URL('peregrine:///__rpc__/'),
      userURL: new URL('peregrine:///__user__/'),
      ...config,
    }
  }

  createConnection(context: Window): iOSConnection {
    return new iOSConnection({
      rpcURL: this.config.rpcURL,
      context,
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
    return new URL(path, this.config.userURL)
  }
}
