import LocalConnector from '../LocalConnector'
import ProxyClient from '../ProxyClient'
import type RemoteObservableEvent from '../RemoteObservableEvent'
import AsyncIterableSubject from '../lib/AsyncIterableSubject'

type ConnectorInterface = {
  'fn1': () => Promise<void>
  'fn2': (data: string) => Promise<string>
  'evt1$': () => AsyncGenerator
  'nested.fn': (data: string) => Promise<string>
  'nested.evt$': () => AsyncGenerator
}

const createClient = (interfaceOverrides: Partial<ConnectorInterface> = {}) => {
  const events = new AsyncIterableSubject<RemoteObservableEvent>()
  const connector = new LocalConnector<ConnectorInterface>({
    interface: {
      'fn1': async () => {
        // do nothing
      },
      'fn2': async data => data,
      'evt1$': async function* () {
        // do nothing
      },
      'nested.fn': async data => data,
      'nested.evt$': async function* () {
        // do nothing
      },
      ...interfaceOverrides,
    },
    events,
  })

  return new ProxyClient<{
    [K in keyof ConnectorInterface]: ConnectorInterface[K] extends () => AsyncGenerator
      ? AsyncGenerator
      : ConnectorInterface[K]
  }>({ connector, events })
}

it('should allow instantiation with new', async () => {
  const client = createClient()
  expect(client).toBeInstanceOf(ProxyClient)
})

it('should have proper types', async () => {
  const client = createClient()
  expect(typeof ProxyClient).toBe('function')
  expect(typeof client).toBe('object')
})

it('should not allow instantiation without new', async () => {
  expect(ProxyClient).toThrowError(`cannot be invoked without 'new'`)
})

it('should instantiate different instances', async () => {
  const client1 = createClient()
  const client2 = createClient()
  expect(client1).not.toBe(client2)
})

it('should have super methods', async () => {
  const client = createClient()
  expect(client.connect).toBeDefined()
  expect(client.disconnect).toBeDefined()
  expect(client.get).toBeDefined()
  expect(client.invoke).toBeDefined()
  expect(client.url).toBeDefined()
})

it('should proxy unknown properties to functions', async () => {
  const client = createClient()
  expect(client.fn1).toBeDefined()
  expect(typeof client.fn1).toBe('function')
})

it('should proxy unknown properties ending in a $ to observables', async () => {
  const client = createClient()
  expect(client.evt1$).toBeDefined()
  expect(typeof client.evt1$).toBe('object')
})

it('should provide same reference for functions', async () => {
  const client = createClient()
  expect(client.fn1 === client.fn1).toBe(true)
})

it('should provide same reference for nested functions', async () => {
  const client = createClient()
  expect(client.nested.fn === client.nested.fn).toBe(true)
})

it('should provide different reference for observables', async () => {
  const client = createClient()
  expect(client.evt1$ === client.evt1$).toBe(false)
})

it('should provide different reference for nested observables', async () => {
  const client = createClient()
  expect(client.nested.evt$ === client.nested.evt$).toBe(false)
})

it('should throw error if calling a function before connected', async () => {
  const client = createClient()
  expect(client.fn1).rejects.toThrowError('Client is not connected')
})

it('should proxy function calls to the connector', async () => {
  const spy = jest.fn().mockReturnValue('pong')
  const client = createClient({ fn2: spy })
  await client.connect()
  const result = await client.fn2('ping')
  expect(spy).toHaveBeenCalledWith('ping')
  expect(result).toBe('pong')
})

it('should proxy nested function calls to the connector', async () => {
  const spy = jest.fn().mockReturnValue('pong')
  const client = createClient({ 'nested.fn': spy })
  await client.connect()
  const result = await client.nested.fn('ping')
  expect(spy).toHaveBeenCalledWith('ping')
  expect(result).toBe('pong')
})

it('should proxy observables to the connector', async () => {
  expect.assertions(1)

  const client = createClient({
    evt1$: async function* () {
      yield 1
    },
  })

  await client.connect()

  const subscribe = async () => {
    for await (const event of client.evt1$) {
      expect(event).toEqual(1)
    }
    expect(true).toBe(false) // won't reach because observables never stop iterating
  }

  subscribe()
})

it('should proxy nested observables to the connector', async () => {
  expect.assertions(1)

  const client = createClient({
    'nested.evt$': async function* () {
      yield 1
    },
  })

  await client.connect()

  const subscribe = async () => {
    for await (const event of client.nested.evt$) {
      expect(event).toEqual(1)
    }
    expect(true).toBe(false) // won't reach because observables never stop iterating
  }

  subscribe()
})

it('should handle multiple iterations of an observable', async () => {
  expect.assertions(3)

  const client = createClient({
    evt1$: async function* () {
      yield 1
    },
  })

  await client.connect()

  const subscribe = async () => {
    for await (const value of client.evt1$) {
      expect(value).toEqual(1)
    }
  }

  subscribe()
  subscribe()
  subscribe()
})
