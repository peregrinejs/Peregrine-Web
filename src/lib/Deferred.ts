export type PromiseState = 'pending' | 'fulfilled' | 'rejected'

export default class Deferred<T> {
  private _resolve!: (value: T | PromiseLike<T>) => void
  private _reject!: (reason?: any) => void

  readonly promise: Promise<T> = new Promise((resolve, reject) => {
    this._resolve = resolve
    this._reject = reject
  })

  state: PromiseState = 'pending'

  resolve(value: T | PromiseLike<T>): void {
    if (this.state === 'pending') {
      this.state = 'fulfilled'
      this._resolve(value)
    }
  }

  reject(reason?: any): void {
    if (this.state === 'pending') {
      this.state = 'rejected'
      this._reject(reason)
    }
  }
}
