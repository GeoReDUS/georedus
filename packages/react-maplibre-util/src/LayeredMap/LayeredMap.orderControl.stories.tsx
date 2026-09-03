import React, { useCallback, useMemo, useState } from 'react'
import { LayeredMap } from './LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LayeredMapProps } from '../types'
import '@radix-ui/themes/styles.css'
import { layeredMapMouseEventHandler } from './layeredMapMouseEventHandler'
import { InputProvider, Input, INPUTS } from '@orioro/react-ui-core'
import { Theme } from '@radix-ui/themes'

export default {
  title: 'LayeredMap / Order Control',
  parameters: {
    layout: 'fullscreen',
  },
}

const LAYER_SPECS = {
  paises: {
    interactive: true,
    type: 'fill',
    source: 'paises',
    paint: {
      'fill-color': 'green',
      'fill-opacity': 1,
    },
  },
  estados: {
    interactive: true,
    type: 'fill',
    source: 'estados',
    paint: {
      'fill-color': 'blue',
      'fill-opacity': 1,
    },
  },
  municipios: {
    interactive: true,
    type: 'fill',
    source: 'municipios',
    paint: {
      'fill-color': 'red',
      'fill-opacity': 1,
    },
  },
}

export const Basic = () => {
  const [viewState, setViewState] = useState<
    Omit<LayeredMapProps, 'views' | 'onMove'>
  >({
    latitude: -1.455833,
    longitude: -48.503887,
    zoom: 6,
  })

  const onMove = useCallback((evt) => setViewState(evt.viewState), [])

  const onClick = useMemo(() => layeredMapMouseEventHandler('onClick'), [])

  const [layerOrder, setLayerOrder] = useState([
    'paises',
    'estados',
    'municipios',
  ])

  const resolvedLayers = useMemo(() => {
    return Object.fromEntries(
      layerOrder.map((layerId) => [layerId, LAYER_SPECS[layerId]]),
    )
  }, [layerOrder])

  return (
    <Theme>
      <InputProvider renderers={INPUTS}>
        <div>
          <Input
            schema={{
              type: 'array',
              ofType: {
                type: 'text',
              },
            }}
            value={layerOrder}
            onSetValue={setLayerOrder}
          />
        </div>
        <LayeredMap
          {...viewState}
          onClick={onClick}
          onMove={onMove}
          style={{
            height: '100vh',
            width: '100vw',
          }}
          mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
          views={[
            {
              id: 'test',
              sources: {
                municipios: {
                  type: 'geojson',
                  promoteId: 'codarea',
                  data: `https://servicodados.ibge.gov.br/api/v4/malhas/municipios/1501402?formato=application/vnd.geo+json`,
                },
                estados: {
                  type: 'geojson',
                  promoteId: 'codarea',
                  data: `https://servicodados.ibge.gov.br/api/v4/malhas/estados/15?formato=application/vnd.geo+json`,
                },
                paises: {
                  type: 'geojson',
                  promoteId: 'codarea',
                  data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?formato=application/vnd.geo+json`,
                },
              },
              layers: resolvedLayers,
            },
          ]}
        />
      </InputProvider>
    </Theme>
  )
}
