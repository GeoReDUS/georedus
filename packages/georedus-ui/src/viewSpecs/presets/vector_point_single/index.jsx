import { confSchema } from './confSchema'
import { metadata } from './metadata'
import { layers } from './layers'
import { sources } from './sources'
import { pick } from 'lodash'
import { parseStyleSpec } from './parseStyleSpec'
import { download } from './download'

export function vector_point_single(
  { style, ...viewSpec },
  allViewSpecs,
  context,
) {
  viewSpec = {
    ...viewSpec,
    style: parseStyleSpec(style),
  }

  return {
    ...pick(viewSpec, ['id', 'path', 'label', 'sourceLabel']),
    confSchema: confSchema(viewSpec, allViewSpecs, context),
    metadata: metadata(viewSpec, allViewSpecs, context),
    sources: sources(viewSpec, allViewSpecs, context),
    layers: layers(viewSpec, allViewSpecs, context),
    download: download(viewSpec, allViewSpecs, context),
  }
}
