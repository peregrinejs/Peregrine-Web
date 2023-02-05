import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
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
    typescript({ tsconfig: 'tsconfig.json' }),
    terser({
      compress: false,
      mangle: false,
      format: {
        preamble: `
// Peregrine for Web: native container for hybrid apps
// Copyright (C) 2022 Caracal LLC
        `.trim(),
      },
    }),
  ],
})
