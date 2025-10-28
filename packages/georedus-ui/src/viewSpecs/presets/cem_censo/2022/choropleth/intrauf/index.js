import { metadata } from './metadata'
import { municipio_sources, municipio_layers } from './municipio'

export const intrauf = {
  metadata,
  sources(opts) {
    return {
      ...municipio_sources(opts),
    }
  },
  layers(opts) {
    return {
      ...municipio_layers(opts),
    }
  },
}
