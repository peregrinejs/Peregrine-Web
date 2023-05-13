import Deferred from './Deferred'
import assert from './assert'

export default class AsyncIterableSubject<T> implements AsyncIterable<T> {
  private _deferred: Deferred<T> = new Deferred()
  private _done = false

  /**
   * Feed a value to the subject.
   *
   * This method must not be called in sequence synchronously. The previous
   * value must be consumed by the iterator before the next value can be
   * accepted by the subject.
   */
  next(value: T): void {
    if (this._done) {
      return
    }

    assert(
      this._deferred.state === 'pending',
      'Cannot feed value--previous value(s) are unconsumed.',
    )

    this._deferred.resolve(value)
  }

  /**
   * Mark the subject as done, after which new values are ignored.
   */
  done(): void {
    this._done = true
    this._deferred.resolve(undefined as T)
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: async () => {
        const result = await this._deferred.promise
        this._deferred = new Deferred()
        return {
          value: result,
          done: this._done,
        }
      },
      return: async value => {
        this._done = true
        return {
          value,
          done: this._done,
        }
      },
      throw: async e => {
        return {
          value: e,
          done: this._done,
        }
      },
    }
  }
}
