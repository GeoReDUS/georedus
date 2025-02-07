import { rollupConfig } from '@orioro/dev/react'

import PACKAGE_JSON from './package.json' assert { type: 'json' }

const DEPENDENCY_NAMES = [
  ...Object.keys(PACKAGE_JSON.dependencies),
  ...Object.keys(PACKAGE_JSON.devDependencies),
]

export default rollupConfig((base) => ({
  ...base,
  external: (id) => {
    return (
      id.includes('node_modules') ||
      DEPENDENCY_NAMES.some((name) => id.startsWith(name))
    )
  },
}))
