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
import getPropertyNames from './lib/getPropertyNames'

class _ProxyClient<T extends RemoteInterface> extends StringClient<T> {}

type Endpoint = ((...args: any[]) => any) | AsyncGenerator<any>

const ProxyClient: {
  new <T extends RemoteInterface>(): DottedToNested<T, Endpoint> &
    _ProxyClient<T>
} = function <T extends RemoteInterface>() {
  const target = new _ProxyClient<T>()
  const targetProperties = getPropertyNames(target)

  const createDeepProxy = (basePath: string): any => {
    const endpoint = function () {}

    Object.defineProperty(endpoint.constructor, 'name', {
      value: basePath,
      writable: false,
    })

    const endpointProperties = getPropertyNames(endpoint)

    const handler: ProxyHandler<object> = {
      apply: (_1, _2, args) => target.invoke(basePath, ...args),
      has: (_1, _2) => true,
      get: (_1, property) => {
        if (endpointProperties.has(property) || typeof property === 'symbol') {
          return endpoint[property as keyof typeof endpoint]
        }

        const endpointPath = `${basePath}.${property}`

        if (property.endsWith('$')) {
          return target.get(endpointPath)
        }

        return createDeepProxy(endpointPath)
      },
    }

    return new Proxy(endpoint, handler)
  }

  const handler: ProxyHandler<_ProxyClient<T>> = {
    get: (_, property) => {
      if (targetProperties.has(property) || typeof property === 'symbol') {
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
