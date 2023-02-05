export default function getPropertyNames(obj: any): Set<string | symbol> {
  const names: Set<string | symbol> = new Set()
  let proto = obj

  while (proto !== null) {
    for (const prop of Object.getOwnPropertyNames(proto)) {
      names.add(prop)
    }

    proto = Object.getPrototypeOf(proto)
  }

  return names
}
