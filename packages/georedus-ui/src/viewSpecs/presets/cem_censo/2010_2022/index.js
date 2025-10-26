import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../../../constants'

import { globalResources } from '../../../util'

import { parseSchema } from './parseSchema'
import { chartUtil } from './chartUtil'
import { confSchema } from './confSchema'
import { metadata, _resolveSourceBounds } from './metadata'
import { dataUtil } from './dataUtil'
import { customGeoJSON } from './customGeoJSON'
import { setor_censitario } from './setor_censitario'
import { buildings } from './buildings'
import { download } from './download'

export function cem_censo_2010_2022(viewSpec, allViewSpecs, context) {
  const PARSED_SCHEMA = parseSchema(viewSpec, allViewSpecs, context)

  if (!PARSED_SCHEMA) {
    return null
  }

  const CHART_UTIL = chartUtil(viewSpec, allViewSpecs, context)

  const DATA_UTIL = dataUtil(viewSpec, allViewSpecs, context, {
    PARSED_SCHEMA,
  })
  const GLOBAL = globalResources(context)

  const CUSTOM_GEO_JSON = customGeoJSON(viewSpec, allViewSpecs, context, {
    PARSED_SCHEMA,
    CHART_UTIL,
  })

  const SETOR_CENSITARIO = setor_censitario(viewSpec, allViewSpecs, context, {
    PARSED_SCHEMA,
    CHART_UTIL,
    DATA_UTIL,
  })

  const BUILDINGS = buildings(viewSpec, allViewSpecs, context, {
    PARSED_SCHEMA,
    CHART_UTIL,
    DATA_UTIL,
  })

  const DOWNLOAD = download(viewSpec, allViewSpecs, context, {
    PARSED_SCHEMA,
  })

  return {
    // debug: true,
    id: PARSED_SCHEMA.viewId,
    path: PARSED_SCHEMA.path,
    label: PARSED_SCHEMA.label,
    metodology: PARSED_SCHEMA.metodology,
    sourceLabel: PARSED_SCHEMA.sourceLabel,
    keywords: PARSED_SCHEMA.keywords,
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,

    confSchema: confSchema(viewSpec, allViewSpecs, context, {
      PARSED_SCHEMA,
    }),

    metadata: metadata(viewSpec, allViewSpecs, context, {
      PARSED_SCHEMA,
      CHART_UTIL,
      DATA_UTIL,
    }),

    sources: {
      ...Object.fromEntries(
        Object.entries(GLOBAL.sources).map(([key, spec]) => [
          key,
          {
            ...spec,
            bounds: _resolveSourceBounds,
          },
        ]),
      ),

      ...CUSTOM_GEO_JSON.sources,
      ...SETOR_CENSITARIO.sources,
      ...BUILDINGS.sources,
    },
    layers: {
      ...GLOBAL.layers,
      ...CUSTOM_GEO_JSON.layers,
      ...SETOR_CENSITARIO.layers,
      ...BUILDINGS.layers,
    },
    download: DOWNLOAD,
  }
}
