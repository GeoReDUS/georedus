import { wrap } from 'comlink'

const worker =
  typeof Worker !== 'undefined' &&
  new Worker(new URL('./GeoReDUSWorker.worker.ts', import.meta.url), {
    type: 'module',
  })

export const GeoReDUSWorker = worker ? wrap(worker) : null
