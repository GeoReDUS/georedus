import { pick } from 'lodash'
import { sources } from './sources'
import { layers } from './layers'
import { confSchema } from './confSchema'

export function gtfs_travel_time_hex(
  { style, ...viewSpec },
  allViewSpecs,
  context,
) {
  return {
    ...pick(viewSpec, [
      'id',
      'path',
      'label',
      'sourceLabel',
      'metodology',
      'shortDescription',
    ]),
    confSchema: confSchema(viewSpec, allViewSpecs, context),
    sources: sources(viewSpec, allViewSpecs, context),
    layers: layers(viewSpec, allViewSpecs, context),
  }
}
