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

const logargs = (message: string): string[] => {
  return [
    `%cPeregrine%c ${message}`,
    'background: #19657d; margin-top: -1px; padding: 1px 7px 0; color: #fff',
    '',
  ]
}

export const log = {
  debug: (message: string, ...args: any[]): void => {
    console.debug(...logargs(message), ...args)
  },
  info: (message: string, ...args: any[]): void => {
    console.info(...logargs(message), ...args)
  },
  error: (message: string, ...args: any[]): void => {
    console.error(...logargs(message), ...args)
  },
}
