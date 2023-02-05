import { ErrorMessages } from './Client'
import type { RemoteInterface } from './StringClient'
import StringClient from './StringClient'
import type DottedToNested from './lib/DottedToNested'
import assert from './lib/assert'
import getPropertyNames from './lib/getPropertyNames'
import isNonNull from './lib/isNonNull'

class ProxyClient<T extends RemoteInterface> extends StringClient<T> {
  /** @internal */
  readonly _proxyCache: Map<string, any> = new Map()
}

type Endpoint = ((...args: any[]) => any) | AsyncGenerator<any>

const createProxy = (client: ProxyClient<any>, basePath?: string) => {
  const target = basePath ? client.get(basePath) : client
  const targetProperties = getPropertyNames(target)

  const handler: ProxyHandler<ProxyClient<any>> = {
    apply: (_1, _2, args) => {
      assert(isNonNull(basePath), ErrorMessages.BAD_INVOCATION)
      return client.invoke(basePath, ...args)
    },
    get: (_, property) => {
      if (targetProperties.has(property) || typeof property === 'symbol') {
        return target[property as keyof typeof target]
      }

      const endpointPath = basePath ? `${basePath}.${property}` : property

      if (property.endsWith('$')) {
        return client.get(endpointPath)
      }

      let proxy = client._proxyCache.get(endpointPath)

      if (!proxy) {
        proxy = createProxy(client, endpointPath)
        client._proxyCache.set(endpointPath, proxy)
      }

      return proxy
    },
  }

  return new Proxy(target, handler)
}

const _ProxyClient: {
  new <T extends RemoteInterface>(
    ...args: ConstructorParameters<typeof ProxyClient>
  ): DottedToNested<T, Endpoint> & ProxyClient<T>
} = new Proxy(ProxyClient, {
  construct: (target, args) => createProxy(new target(...args)),
}) as any

export default _ProxyClient
