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

import type { RemoteInterface } from './StringClient'
import StringClient from './StringClient'
import type DottedToNested from './lib/DottedToNested'
import assert from './lib/assert'
import getPropertyNames from './lib/getPropertyNames'

class _ProxyClient<T extends RemoteInterface> extends StringClient<T> {}

type Endpoint = ((...args: any[]) => any) | AsyncGenerator<any>

const ProxyClient: {
  new <T extends RemoteInterface>(): DottedToNested<T, Endpoint> &
    _ProxyClient<T>
} = function <T extends RemoteInterface>() {
  const target = new _ProxyClient<T>()
  const targetProperties = getPropertyNames(target)

  const createDeepProxy = (endpointPath: string): any => {
    return new Proxy(
      {},
      {
        apply: (_1, _2, args) => {
          return target.invoke(endpointPath, ...args)
        },
        get: (_1, property) => {
          assert(typeof property === 'string', 'property must be a string')

          const endpoint = `${endpointPath}.${property}`

          if (property.endsWith('$')) {
            return target.get(endpoint)
          }

          return createDeepProxy(endpoint)
        },
      },
    )
  }

  const handler: ProxyHandler<_ProxyClient<T>> = {
    get: (_, property) => {
      if (targetProperties.includes(property) || typeof property === 'symbol') {
        return target[property as keyof typeof target]
      }

      if (property.endsWith('$')) {
        return target.get(property)
      }

      return createDeepProxy(property)
    },
  }

  return new Proxy(target, handler)
} as any

export default ProxyClient
