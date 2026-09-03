import React, { useCallback, useMemo, useState } from 'react'
import { LayeredMap } from './LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LayeredMapProps } from '../types'
import '@radix-ui/themes/styles.css'
import { layeredMapOnClickHandler } from './layeredMapOnClickHandler'
import { InputProvider, Input, INPUTS } from '@orioro/react-ui-core'
import { Theme } from '@radix-ui/themes'

export default {
  title: 'LayeredMap / Local Style Control',
  parameters: {
    layout: 'fullscreen',
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

  const onClick = useMemo(() => layeredMapOnClickHandler(), [])

  const [opacity, setOpacity] = useState(1)

  return (
    <Theme>
      <InputProvider renderers={INPUTS}>
        <div
          style={{
            padding: 40,
            background: 'white',
          }}
        >
          <Input
            schema={{
              type: 'slider',
              min: 0,
              max: 1,
              step: 0.1,
            }}
            value={opacity}
            onSetValue={setOpacity}
          />
          <div>{opacity}</div>
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
              },
              layers: {
                municipios: {
                  interactive: true,
                  type: 'fill',
                  source: 'municipios',
                  paint: {
                    'fill-color': 'red',
                    'fill-opacity': opacity,
                  },
                },
              },
            },
          ]}
        />
      </InputProvider>
    </Theme>
  )
}
