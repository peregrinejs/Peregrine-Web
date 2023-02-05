export default function assert(value: unknown, message: string): asserts value {
  if (!value) {
    throw new Error(message)
  }
}
