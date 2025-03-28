import { wrap } from 'comlink'

const worker = new Worker(
  new URL('./GeoReDUSWorker.worker.ts', import.meta.url),
  {
    type: 'module',
  },
)

export const GeoReDUSWorker = wrap(worker)
