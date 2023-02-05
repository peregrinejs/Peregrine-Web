/**
 * Checks if data contains no bytes.
 *
 * Data is empty if it's an empty string or ArrayBuffer.
 *
 * @param data Data to check.
 * @returns true if data is empty, false otherwise.
 */
export const isDataEmpty = (data: Data): boolean =>
  !data || (data as any).byteLength === 0

type Data = string | object | ArrayBuffer

export default Data
