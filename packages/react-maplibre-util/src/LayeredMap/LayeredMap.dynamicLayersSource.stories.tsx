import React, { useMemo, useState } from 'react'
import { LayeredMap } from './LayeredMap'

export default {
  title: 'LayeredMap / Dynamic Layer Source',
  parameters: {
    layout: 'fullscreen',
  },
}

const SOURCES = {
  vector_demotiles: {
    type: 'vector',
    url: 'https://demotiles.maplibre.org/tiles/tiles.json',
  },
  geojson_br: {
    type: 'geojson',
    data: 'https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?formato=application/vnd.geo+json&intrarregiao=municipio&qualidade=minima',
  },
}

export const Basic = () => {
  const [selectedType, setSelectedType] = useState('line')
  const [selectedSource, setSelectedSource] = useState('vector_demotiles')
  const [selectedSourceLayer, setSelectedSourceLayer] = useState('countries')

  const views = useMemo(
    () => [
      {
        id: 'test',
        sources: SOURCES,
        layers: {
          demotiles: {
            interactive: true,
            type: selectedType,
            paint: {
              line: {
                'line-color': 'green',
                'line-opacity': 1,
              },
              circle: {
                'circle-color': 'blue',
              },
              fill: {
                'fill-color': 'red',
                'fill-opacity': 0.5,
              },
              'fill-extrusion': {
                'fill-extrusion-color': 'orange',
                'fill-extrusion-height': 40000,
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.5,
              },
              heatmap: {},
            }[selectedType],

            source: selectedSource,
            //
            // in case selected source is vector, also apply selectedSourceLayer
            //
            ...(selectedSource === 'vector_demotiles'
              ? {
                  'source-layer': selectedSourceLayer,
                }
              : {}),
          },
        },
      },
    ],
    [selectedType, selectedSource, selectedSourceLayer],
  )

  return (
    <>
      <div
        style={{
          fontFamily: 'sans-serif',
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'white',
          padding: 12,
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          width: 320,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {['line', 'fill', 'fill-extrusion', 'circle', 'heatmap'].map(
              (type) => (
                <option value={type}>type: {type}</option>
              ),
            )}
          </select>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            {Object.keys(SOURCES).map((sourceId) => (
              <option value={sourceId}>source: {sourceId}</option>
            ))}
          </select>
          {selectedSource === 'vector_demotiles' && (
            <select
              value={selectedSourceLayer}
              onChange={(e) => setSelectedSourceLayer(e.target.value)}
            >
              {['countries', 'geolines'].map((sourceLayer) => (
                <option value={sourceLayer}>source-layer: {sourceLayer}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
          Changing <code>type</code>, <code>source</code>, or{' '}
          <code>source-layer</code> on a layer can't be pushed to an existing
          layer either — MapLibre has no method to change what a layer points to
          once it's created. Try switching the type, source, or source-layer
          above: <code>LayeredMap</code> detects these changes and remounts the
          layer, so watch it disappear and reappear rather than smoothly
          transition.
        </div>
      </div>
      <LayeredMap
        style={{
          height: '100vh',
          width: '100vw',
        }}
        mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
        views={views}
      />
    </>
  )
}
