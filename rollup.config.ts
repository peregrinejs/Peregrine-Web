import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/peregrine.bundle.min.js',
      format: 'iife',
      name: 'Peregrine',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    typescript(),
    terser({
      compress: false,
      mangle: false,
      format: {
        preamble: `
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
        `.trim(),
      },
    }),
  ],
})
