import { metadata } from './metadata'
import { layers } from './layers'
import { sources } from './sources'
import { pick } from 'lodash'
import { parseStyleSpec } from './parseStyleSpec'
import { download } from './download'

export function vector_heatmap(
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
    metadata: metadata(viewSpec, allViewSpecs, context),
    sources: sources(viewSpec, allViewSpecs, context),
    layers: layers(viewSpec, allViewSpecs, context),
    download: download(viewSpec, allViewSpecs, context),
  }
}
