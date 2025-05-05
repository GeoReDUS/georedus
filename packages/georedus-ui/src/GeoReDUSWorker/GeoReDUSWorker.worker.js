import * as Comlink from 'comlink'
import { scaleNaturalBreaks } from '@orioro/scale-util'
import { dissolveAreasPreservingIsolated } from './methods/dissolveAreasPreservingIsolated'

import { buffer } from './methods/buffer'

const api = {
  scaleNaturalBreaks,
  dissolveAreasPreservingIsolated,
  buffer,
}

Comlink.expose(api)
