import { GeoReDUS } from '../../../GeoReDUS'

import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

export default {
  title: 'Presets / raster_categorical',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

const API = {
  METADATA_API_ENDPOINT: (
    process.env.STORYBOOK_METADATA_API_ENDPOINT || ''
  ).replace(/\/$/, ''),
  VECTOR_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_VECTOR_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
  RASTER_TILE_SERVER_ENDPOINT: (
    process.env.STORYBOOK_RASTER_TILE_SERVER_ENDPOINT || ''
  ).replace(/\/$/, ''),
}

const VERSION_SPECS = [
  {
    id: 'v0',
    fromPrev: (prev) => ({ baseMapStyle: 'dataviz', ...(prev || {}) }),
    fromNext: (next) => next || {},
  },
]

const useVersionedSearchParamsState = versionedSearchParamsStateHook(
  VERSION_SPECS,
  useSearchParams,
)

const VIEW_SPECS = {
  all: [
    [
      {
        id: 'mapbiomas_espraiamento_mancha_urbana',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'raster_categorical',
        path: 'Raster Test / _',
        label: 'Espraiamento Urbano',
        tiles:
          'https://georedus-prod-raster-server.orioro.design/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}@2x?url=s3%3A%2F%2Fgeoredus-prod-private-us-east-1%2Fraster-server%2Fmapbiomas%2Fespraiamento_mancha_urbana%2Fmosaic.json',
        style: {
          categories: [
            { value: 1985, color: 'schemeYlOrRd.scalesByK.5.0' },
            { value: 1995, color: 'schemeYlOrRd.scalesByK.5.1' },
            { value: 2005, color: 'schemeYlOrRd.scalesByK.5.2' },
            { value: 2015, color: 'schemeYlOrRd.scalesByK.5.3' },
            { value: 2024, color: 'schemeYlOrRd.scalesByK.5.4' },
          ],
        },
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
      {
        id: 'mapbiomas_cobertura_vegetal',
        collection_id: 'test',
        indicator_id: 'test',
        preset: 'raster_categorical',
        path: 'Raster Test / _',
        label: 'Cobertura Vegetal',
        tiles:
          'https://georedus-prod-raster-server.orioro.design/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}@2x?url=s3%3A%2F%2Fgeoredus-prod-private-us-east-1%2Fraster-server%2Fmapbiomas%2Fcobertura_vegetal_2023%2Fmosaic.json',
        style: {
          colorScheme: 'schemeGeoReDUS',
          categories: [
            { value: 3, label: 'Formação Florestal' },
            { value: 4, label: 'Formação Savânica' },
            { value: 5, label: 'Mangue' },
            { value: 6, label: 'Floresta Alagável' },
            { value: 9, label: 'Silvicultura' },
            { value: 11, label: 'Campo Alagado e Área Pantanosa' },
            { value: 12, label: 'Formação Campestre' },
            { value: 15, label: 'Pastagem' },
            { value: 19, label: 'Lavoura Temporária' },
            { value: 21, label: 'Mosaico de Usos' },
            { value: 23, label: 'Praia, Duna e Arenal' },
            { value: 24, label: 'Área Urbanizada' },
            { value: 25, label: 'Outra Área não Vegetadas' },
            { value: 29, label: 'Afloramento Rochoso' },
            { value: 30, label: 'Mineração' },
            { value: 31, label: 'Aquicultura' },
            { value: 32, label: 'Apicum' },
            { value: 33, label: 'Rio, Lago e Oceano' },
            { value: 36, label: 'Lavoura Perene' },
            { value: 49, label: 'Restinga Arbórea' },
            { value: 50, label: 'Restinga Herbácea' },
          ],
        },
        sourceLabel: 'TEst',
        metodology: 'test metodology',
      },
    ],
  ],
}

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {
      //Belém (IBGE código)
      municipioId: 1501402,
    },
    {
      schema: {
        baseMapStyle: 'string',
        municipioId: 'string',
        regional: 'boolean',
        viewConf: 'object',
        env: 'string',
      },
    },
  )

  return (
    <GeoReDUS
      state={stateStorage}
      onSetState={setStateStorage}
      viewSpecs={VIEW_SPECS}
      api={API}
      // leftPanel={{
      //   categoryIcons: CATEGORY_ICONS,
      // }}
    />
  )
}
