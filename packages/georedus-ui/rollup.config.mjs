import { rollupConfig } from '@orioro/dev/react'

export default rollupConfig({
  input: {
    main: 'src/index.tsx',
    'GeoReDUSWorker.worker': 'src/GeoReDUSWorker/GeoReDUSWorker.worker.js',
  },
  // input: 'src/index.tsx',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].js',
    },
  ],
  external: /node_modules/,
})
