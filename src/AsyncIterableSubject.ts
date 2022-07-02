import Deferred from './lib/Deferred'

export default class AsyncIterableSubject<T> implements AsyncIterable<T> {
  private _deferred: Deferred<T> = new Deferred()

  next(value: T): void {
    this._deferred.resolve(value)
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    yield await this._deferred.promise
    this._deferred = new Deferred()
  }
}
