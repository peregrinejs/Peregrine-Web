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

import type UnionToIntersection from './UnionToIntersection'

type DottedHead<T> = T extends `${infer P1}.${infer _}` ? P1 : T // eslint-disable-line @typescript-eslint/no-unused-vars
type DottedTail<T> = T extends `${infer _}.${infer PX}` ? PX : '' // eslint-disable-line @typescript-eslint/no-unused-vars

type RecurseDottedToNestedUnion<
  T,
  K extends keyof T,
> = K extends `${string}.${string}`
  ? {
      [K in keyof T as DottedHead<K>]: RecurseDottedToNestedUnion<
        { [K2 in DottedTail<K>]: T[K] },
        DottedTail<K>
      >
    }
  : { [K in keyof T]: T[K] }

type DottedToNestedUnion<T> = {
  [K in keyof T as DottedHead<K>]: K extends `${string}.${string}`
    ? RecurseDottedToNestedUnion<{ [K2 in DottedTail<K>]: T[K] }, DottedTail<K>>
    : T[K]
}

type NestedUnionToIntersection<T, E> = T extends E
  ? T
  : { [K in keyof T]: NestedUnionToIntersection<UnionToIntersection<T[K]>, E> }

type DottedToNested<T, E> = NestedUnionToIntersection<DottedToNestedUnion<T>, E>

export default DottedToNested
