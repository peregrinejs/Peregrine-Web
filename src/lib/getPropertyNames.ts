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
