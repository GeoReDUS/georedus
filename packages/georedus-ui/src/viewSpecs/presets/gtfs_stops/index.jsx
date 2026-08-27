import { confSchema } from './confSchema'
import { metadata } from './metadata'
import { layers } from './layers'
import { sources } from './sources'
import { pick } from 'lodash'
import { parseStyleSpec } from './parseStyleSpec'
import { download } from './download'
import { VIEW_TYPE_SURFACE_CHOROPLETH } from '../../constants'

export function gtfs_stops(
  { style, ...viewSpec },
  allViewSpecs,
  context,
) {
  viewSpec = {
    ...viewSpec,
    style: parseStyleSpec(style),
  }

  return {
    ...pick(viewSpec, ['id', 'path', 'label', 'sourceLabel', 'metodology', 'shortDescription']),
    viewType: VIEW_TYPE_SURFACE_CHOROPLETH,
    confSchema: confSchema(viewSpec, allViewSpecs, context),
    metadata: metadata(viewSpec, allViewSpecs, context),
    sources: sources(viewSpec, allViewSpecs, context),
    layers: layers(viewSpec, allViewSpecs, context),
    download: download(viewSpec, allViewSpecs, context),
  }
}
