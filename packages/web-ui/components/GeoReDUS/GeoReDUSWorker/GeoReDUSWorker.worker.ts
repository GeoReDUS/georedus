// A simple Comlink worker that doubles a number
import * as Comlink from 'comlink'
import { scaleNaturalBreaks } from '@orioro/scale-util'
import { dissolveAreasPreservingIsolated } from './methods/dissolveAreasPreservingIsolated'

const api = {
  scaleNaturalBreaks,
  dissolveAreasPreservingIsolated,
}

Comlink.expose(api)
