import { resolve } from '@orioro/resolve'

const DEFAULT_BUFFER_SIZE = 200

export function confSchema(viewSpec, allViewSpecs, context, { PARSED_SCHEMA }) {
  const { variable_id } = viewSpec

  return {
    data: {
      variableId: {
        label: 'Recorte:',
        type: 'treeSelect',
        options: PARSED_SCHEMA.variants.map((variant) => ({
          path: variant.variant_path,
          label: variant.variant_label || variant.variable_id,
          value: variant.variable_id,
        })),
        placeholder: 'Selecione uma variante',
        clearable: false,
        defaultValue: variable_id,
      },
      customSpatialAggregationUnit: {
        type: 'geoFile',
        label: 'Malha territorial customizada',
        helperText:
          'Carregue um arquivo georreferenciado para visualizar os dados de acordo' +
          ' com sua própria malha territorial. Formatos de arquivo suportados: ' +
          [
            'GeoPackage (.gpkg)',
            'KML (.kml)',
            'GML (.gml)',
            // 'CSV (.csv)',
            'TIFF/GeoTIFF (.tif/.tiff)',
            'GeoJSON (.json/.geojson)',
            'ESRI Shapefile (armazenar arquivos .shp, .shx, .dbf, etc. em um arquivo .zip único)',
          ].join(', '),
      },
      pointsDisplayMode: {
        inactive: resolve.literal(
          resolve.fn((context) => {
            const geometryTypes =
              context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA
                ?.geometryTypes

            return (
              !Array.isArray(geometryTypes) || !geometryTypes.includes('Point')
            )
          }),
        ),
        clearable: false,
        type: 'treeSelect',
        label: 'Visualizar pontos',
        options: [
          {
            path: null,
            label: 'Círculos',
            value: 'circle',
          },
          {
            path: null,
            label: 'Mapa de calor',
            value: 'heatmap',
          },
        ],
        defaultValue: 'circle',
      },
      bufferSize: {
        type: 'slider',
        label: resolve.literal(
          resolve.fn((context) => {
            return `Raio de influência (${context.value?.bufferSize || DEFAULT_BUFFER_SIZE}m)`
          }),
        ),
        helperText: 'Raio de influência do ponto',
        min: 0,
        max: 2000,
        step: 50,
        defaultValue: DEFAULT_BUFFER_SIZE,
        inactive: resolve.literal(
          resolve.fn((context) => {
            const geometryTypes =
              context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA
                ?.geometryTypes

            return (
              !Array.isArray(geometryTypes) ||
              (!geometryTypes.includes('Point') &&
                !geometryTypes.includes('LineString')) ||
              context.value?.pointsDisplayMode === 'heatmap'
            )
          }),
        ),
      },

      dissolveOverlappingGeometries: {
        inactive: resolve.literal(
          resolve.fn((context) => {
            return (
              !Boolean(
                context.value?.customSpatialAggregationUnit?.GEO_FILE_METADATA,
              ) || context.value?.pointsDisplayMode === 'heatmap'
            )
          }),
        ),
        type: 'booleanCheckbox',
        label: 'Dissolver geometrias',
        description: 'Unir geometrias sobrepostas',
        defaultValue: false,
      },
    },
    style: {
      layerOpacity: {
        type: 'slider',
        label: 'Opacidade da camada',
        size: '1',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 1,
        notify: 'layers',
      },
    },
  }
}
