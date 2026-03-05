import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../../../constants'

import { parseSchema } from '../2010_2022/parseSchema'
import { confSchema } from '../2010_2022/confSchema'
// import { _resolveSourceBounds } from '../2010_2022/metadata'
import { download } from '../2022/download'

import { choropleth } from './choropleth'
import { omit } from 'lodash'

export function cem_censo_2022(viewSpec, allViewSpecs, context) {
  const PARSED_SCHEMA = parseSchema(viewSpec, allViewSpecs, context)

  if (!PARSED_SCHEMA) {
    return null
  }

  const DOWNLOAD = download(context)

  const CHOROPLETH = choropleth({
    GLOBAL_CONTEXT: context,
    PARSED_SCHEMA,
  })

  const CONF_SCHEMA = confSchema(viewSpec, allViewSpecs, context, {
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

    confSchema: {
      ...CONF_SCHEMA,
      data: omit(
        CONF_SCHEMA.data,
        //
        // Current version does not support
        // dissolveOverlappingGeometries
        // TODO: study implementation
        //
        ['dissolveOverlappingGeometries'],
      ),
    },

    metadata: {
      ...CHOROPLETH.metadata,
    },

    sources: {
      ...CHOROPLETH.sources,
    },
    layers: {
      // ...GLOBAL.layers,
      ...CHOROPLETH.layers,
    },
    download: DOWNLOAD,
  }
}
