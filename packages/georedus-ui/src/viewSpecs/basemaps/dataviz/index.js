import { br_municipios } from '../util/br_municipios'
import {
  mapTilerSpecFromStyleJson,
  MAP_TILER_DATAVIZ_MAP_STYLE,
} from '../util/maptiler'

const MAP_TILER = mapTilerSpecFromStyleJson({
  styleJson: MAP_TILER_DATAVIZ_MAP_STYLE,
  topLayerIds: [
    // 'background',
    // 'residential',
    'landcover',
    'forest',
    'stadium',
    // 'cemetery',
    // 'river',
    // 'water_shadow',
    // 'water',
    'aeroway',
    'tunnel_outline',
    'tunnel_path',
    'tunnel',
    'railway_tunnel',
    'railway_tunnel_dash',
    'pier',
    'pier_road',
    'bridge',
    'road_network_outline',
    'road_network',
    'path_outline',
    'path_minor',
    'path',
    'railway',
    'railway_dash',
    // 'building',
    // 'building_top',
    'other_border',
    'other_border_dash',
    'disputed_border',
    'country_border',
    'ocean_labels',
    'sea_labels',
    'lakeline_labels',
    'road_labels',
    'place_labels',
    'village_labels',
    'town_labels',
    'state_labels',
    'city_labels',
    'country_labels',
    'continent_labels',
  ],
})

function fullMapStyle() {
  return MAP_TILER.fullMapStyle
}

//
// A map style with only background
// They are added via mapStyle, not through layered view system
// thus the format is different
//
function baseMapStyle(opts) {
  return {
    version: 8,
    sources: MAP_TILER.sources,
    glyphs: MAP_TILER.glyphs,
    sprite: MAP_TILER.sprite,
    layers: MAP_TILER.baseLayers,
  }
}

function topViews(opts) {
  return [
    {
      id: 'maptiler_top_layers',
      layers: Object.fromEntries(
        MAP_TILER.topLayers.map((layer) => [layer.id, layer]),
      ),
    },
    // br_fcu(opts),
    br_municipios(opts),
  ]
}

export const dataviz = {
  fullMapStyle,
  baseMapStyle,
  topViews,
}
