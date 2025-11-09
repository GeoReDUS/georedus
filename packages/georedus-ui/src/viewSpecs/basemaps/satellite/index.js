import { br_municipios } from '../util/br_municipios'
import {
  mapTilerSpecFromStyleJson,
  MAP_TILER_SATELLITE_MAP_STYLE,
} from '../util/maptiler'

const MAP_TILER = mapTilerSpecFromStyleJson({
  styleJson: MAP_TILER_SATELLITE_MAP_STYLE,
  topLayerIds: [
    // 'satellite',
    'tunnel',
    'path_minor',
    'path',
    'road',
    'railway',
    'other_border',
    'country_dark_border',
    'disputed_border',
    'country_border',
    'road_labels',
    'place_labels',
    'city_labels',
    'state_labels',
    'capital_city_labels',
    'country_labels',
    'continent_labels',
  ],
})

export function fullMapStyle() {
  return MAP_TILER.fullMapStyle
}

//
// A map style with only background
// They are added via mapStyle, not through layered view system
// thus the format is different
//
export function baseMapStyle() {
  return {
    version: 8,
    sources: MAP_TILER.sources,
    glyphs: MAP_TILER.glyphs,
    sprite: MAP_TILER.sprite,
    layers: MAP_TILER.baseLayers,
  }
}

export function topViews(opts) {
  return [
    {
      id: 'maptiler_top_layers',
      layers: Object.fromEntries(
        MAP_TILER.topLayers.map((layer) => [layer.id, layer]),
      ),
    },
    br_municipios(opts),
  ]
}

export const satellite = {
  fullMapStyle,
  baseMapStyle,
  topViews,
}
