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
