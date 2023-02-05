export default function generateId(): string {
  let id = ''
  let count = 4

  const array = new Uint16Array(count)
  const values =
    typeof crypto === 'undefined' ? array : crypto.getRandomValues(array)

  while (count--) {
    id += (values[count] & 46655).toString(36).padStart(3, '_')
  }

  return id
}
