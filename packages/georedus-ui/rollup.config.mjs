import { rollupConfig, ROLLUP_CONFIG } from '@orioro/dev/react'

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
  external: (id) => {
    return (
      id.includes('node_modules') ||
      ROLLUP_CONFIG.external.some((ext) => id.includes(ext))
    )
  },
  // external: /node_modules/,
  // external: (id) => {
  //   return id.includes('node_modules') || id.includes('packages')
  // },
})
