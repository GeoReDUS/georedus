import { pick } from 'lodash'
import { sources } from './sources'
import { layers } from './layers'
// import { parseStyleSpec } from './parseStyleSpec'

export function gtfs_travel_time_hex({ style, ...viewSpec }, allViewSpecs, context) {
  // viewSpec = {
  //   ...viewSpec,
  //   style: parseStyleSpec(style),
  // }

  return {
    ...pick(viewSpec, [
      'id',
      'path',
      'label',
      'sourceLabel',
      'metodology',
      'shortDescription',
    ]),
    sources: sources(viewSpec, allViewSpecs, context),
    layers: layers(viewSpec, allViewSpecs, context),
  }
}
