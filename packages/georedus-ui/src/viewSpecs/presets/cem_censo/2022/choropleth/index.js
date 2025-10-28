import { resolve } from '@orioro/resolve'
import { CHOROPLETH_MODULE_ID } from './constants'
import { intramun } from './intramun'
import { intrauf } from './intrauf'
import { intrabr } from './intrabr'

export * from './constants'

const STAGES_BY_ZOOM_LEVEL = {
  intramun,
  intrauf,
  intrabr,
}

function _stageResolver(stageKey, opts) {
  return resolve.fn((context) => {
    const stage = STAGES_BY_ZOOM_LEVEL[context.app.zoomLevel]?.[stageKey]

    return typeof stage === 'function' ? stage(opts) : {}
  })
}

export function choropleth(opts) {
  return {
    moduleId: CHOROPLETH_MODULE_ID,
    metadata: _stageResolver('metadata', opts),
    sources: _stageResolver('sources', opts),
    layers: _stageResolver('layers', opts),
  }
}
