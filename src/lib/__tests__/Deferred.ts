import Deferred from '../Deferred'

it('should create a deferred promise that resolves', async () => {
  const deferred = new Deferred<number>()
  deferred.resolve(1)
  expect(deferred.promise).resolves.toBe(1)
})

it('should create a deferred promise that rejects', async () => {
  const deferred = new Deferred<number>()
  deferred.reject(new Error('uh oh!'))
  expect(deferred.promise).rejects.toThrowError(/uh oh/)
})
