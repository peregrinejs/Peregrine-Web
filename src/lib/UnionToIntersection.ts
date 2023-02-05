/**
 * Convert a union type to an intersection type.
 *
 * @see https://stackoverflow.com/a/50375286
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

export default UnionToIntersection
