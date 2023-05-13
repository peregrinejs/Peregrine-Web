import Deferred from './Deferred'
import assert from './assert'

export default class AsyncIterableSubject<T> implements AsyncIterable<T> {
  private _deferred: Deferred<T> = new Deferred()
  private _iterating = false

  next(value: T): void {
    assert(
      this._deferred.state === 'pending',
      'Cannot feed value--previous value(s) are unconsumed.',
    )

    this._deferred.resolve(value)
  }

  done(): void {
    assert(
      this._deferred.state === 'pending',
      'Cannot finish--previous value(s) are unconsumed.',
    )

    this._deferred.reject()
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    assert(!this._iterating, 'Cannot iterate more than once.')

    this._iterating = true

    while (true) {
      try {
        const result = await this._deferred.promise
        this._deferred = new Deferred()
        yield result
      } catch {
        return
      }
    }
  }
}
