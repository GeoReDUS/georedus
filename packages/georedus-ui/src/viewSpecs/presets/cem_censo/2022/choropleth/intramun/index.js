import { metadata } from './metadata'
import {
  setor_censitario_sources,
  setor_censitario_layers,
} from './setor_censitario'

import { baseMapSources, baseMapLayers } from './baseMap'

export const intramun = {
  metadata,
  sources(opts) {
    return {
      ...setor_censitario_sources(opts),
      ...baseMapSources(opts),
    }
  },
  layers(opts) {
    return {
      ...setor_censitario_layers(opts),
      ...baseMapLayers(opts),
    }
  },
}
