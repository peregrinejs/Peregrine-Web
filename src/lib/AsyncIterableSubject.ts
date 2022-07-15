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
        yield await this._deferred.promise
        this._deferred = new Deferred()
      } catch {
        return
      }
    }
  }
}
