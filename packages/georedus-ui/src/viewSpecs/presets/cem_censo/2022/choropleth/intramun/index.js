import { metadata } from './metadata'
import {
  setor_censitario_sources,
  setor_censitario_layers,
} from './setor_censitario'

import { buildings_sources, buildings_layers } from './buildings'

export const intramun = {
  metadata,
  sources(opts) {
    return {
      ...setor_censitario_sources(opts),
      ...buildings_sources(opts),
    }
  },
  layers(opts) {
    return {
      ...setor_censitario_layers(opts),
      ...buildings_layers(opts),
    }
  },
}
