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
