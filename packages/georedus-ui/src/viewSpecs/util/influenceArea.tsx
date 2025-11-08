import { get } from '@orioro/get'
import { resolve, resolveAsync } from '@orioro/resolve'
import { GeoReDUSWorker } from '../../GeoReDUSWorker'
import { omit } from 'lodash'
import { ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE } from '.'

type InfluenceAreaConfProps = {
  defaultBufferSize?: number
  maxBufferSize?: number
  minBufferSize?: number
  bufferSizeStep?: number
}

export function influenceAreaConf({
  defaultBufferSize = 200,
  maxBufferSize = 2000,
  minBufferSize = 0,
  bufferSizeStep = 50,
}: InfluenceAreaConfProps = {}) {
  return {
    showInfluenceArea: {
      type: 'booleanCheckbox',
      label: 'Área de influência',
      description: 'Visualizar área de influência',
      defaultValue: true,
    },

    influenceAreaRadius: {
      type: 'slider',
      inactive: resolve.literal(
        resolve.fn((context) => !context.value?.showInfluenceArea),
      ),
      label: resolve.literal(
        resolve.fn((context) => {
          return `Raio de influência (${context.value?.influenceAreaRadius || defaultBufferSize}m)`
        }),
      ),
      helperText: 'Configure um raio de influência do equipamento',
      min: minBufferSize,
      max: maxBufferSize,
      step: bufferSizeStep,
      defaultValue: defaultBufferSize,
    },
    dissolveOverlappingGeometries: {
      inactive: resolve.literal(
        resolve.fn((context) => !context.value?.showInfluenceArea),
      ),
      type: 'booleanCheckbox',
      label: 'Dissolver geometrias',
      description: 'Unir geometrias sobrepostas',
      defaultValue: false,
    },
  }
}

type InfluenceAreaMetadataProps = {
  getGeoJson?: (
    context: Record<string, any>,
  ) => Promise<GeoJSON.FeatureCollection>
  getConf?: (context: Record<string, any>) => Promise<{
    showInfluenceArea: boolean
    influenceAreaRadius: number
    dissolveOverlappingGeometries: boolean
  }>
}

function _defaultGetGeoJson(context: Record<string, any>) {
  return {
    type: 'FeatureCollection',
    features: context.rawData.map(
      (entry: { geom: GeoJSON.Geometry; [key: string]: any }) => ({
        type: 'Feature',
        geometry: entry.geom,
        properties: omit(entry, ['geom']),
      }),
    ),
  }
}

export function influenceAreaMetadata({
  getGeoJson = _defaultGetGeoJson,
  getConf = (context) => get(context, 'view.conf.data') || {},
}: InfluenceAreaMetadataProps = {}) {
  return {
    influenceArea: resolveAsync.fn(async (context) => {
      const {
        influenceAreaRadius,
        showInfluenceArea,
        dissolveOverlappingGeometries,
      } = await getConf(context)

      const geoJson = await getGeoJson(context)

      if (
        showInfluenceArea &&
        typeof influenceAreaRadius === 'number' &&
        influenceAreaRadius > 0 &&
        Array.isArray(geoJson?.features) &&
        geoJson.features.length > 0
      ) {
        try {
          const influenceArea = await GeoReDUSWorker.buffer(
            geoJson,
            influenceAreaRadius,
            {
              units: 'meters',
              dissolve: dissolveOverlappingGeometries,
            },
          )

          return influenceArea
        } catch (err) {
          return null
        }
      }

      return null
    }),
  }
}

type InfluenceAreaSourcesProps = {
  dataPath?: string
}

export function influenceAreaSources({
  dataPath = 'view.metadata.influenceArea',
}: InfluenceAreaSourcesProps = {}) {
  return {
    influenceArea: [
      '$if',
      [['$empty', ['$get', dataPath]]],
      null,
      {
        type: 'geojson',
        data: ['$get', dataPath],
      },
      // resolve.fn((context) => {
      //   return {
      //     type: 'geojson',
      //     data: get(context, dataPath),
      //   }
      // }),
    ],
  }
}

type InfluenceAreaLayersProps = {
  dataPath?: string
  // zIndex?: number

  fillPaint?: Record<string, any>
  boundaryPaint?: Record<string, any>
}

export function influenceAreaLayers({
  dataPath = 'view.metadata.influenceArea',
  // zIndex = ABOVE_BASE_MAP_LAYERS_Z_INDEX_BASE + 1,
  fillPaint = {},
  boundaryPaint = {},
}: InfluenceAreaLayersProps = {}) {
  return {
    influenceArea_fill: {
      // zIndex,
      hidden: ['$empty', ['$get', dataPath]],
      source: 'influenceArea',
      type: 'fill',

      paint: {
        'fill-color': 'red',
        'fill-opacity': 0.3,
        ...fillPaint,
      },
    },
    influenceArea_boundaries: {
      // zIndex,
      hidden: ['$empty', ['$get', dataPath]],
      source: 'influenceArea',
      type: 'line',

      paint: {
        'line-color': 'red',
        'line-opacity': 0.8,
        'line-width': 2,
        'line-dasharray': [2, 2],
        ...boundaryPaint,
      },
    },
  }
}
