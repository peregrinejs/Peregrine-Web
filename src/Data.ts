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
