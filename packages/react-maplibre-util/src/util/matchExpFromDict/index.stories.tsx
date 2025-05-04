import React from 'react'
import { LayeredMap } from '../../LayeredMap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { InspectControl } from '../../Controls/InspectControl'
import { matchExpFromDict } from './matchExpFromDict'

export default {
  title: 'matchExpFromDict',
  parameters: {
    layout: 'fullscreen',
  },
}

const UFS_BY_COLOR = {
  '#FF0000': ['12', '27', '13', '16'],
  '#FF7F00': ['29', '23', '53', '32'],
  '#FFFF00': ['52', '21', '31', '50'],
  '#00FF00': ['51', '15', '25', '26'],
  '#00FFFF': ['22', '41', '33', '24'],
  '#0000FF': ['43', '11', '14', '42'],
  '#8B00FF': ['28', '35', '17'],
}

export const Basic = () => {
  const ufColorExp = matchExpFromDict({
    valueExp: 'codarea',
    dict: UFS_BY_COLOR,
    defaultValue: 'red',
  })

  //
  // Style municipios according to their UFs
  //
  const municipioColorExp = matchExpFromDict({
    valueExp: ['slice', ['get', 'codarea'], 0, 2],
    dict: UFS_BY_COLOR,
    defaultValue: 'green',
  })

  return (
    <LayeredMap
      initialViewState={{
        latitude: -15,
        longitude: -55,
        zoom: 3,
      }}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.STORYBOOK_MAP_TILER_API_KEY}`}
      style={{
        height: '100vh',
        width: '100vw',
      }}
      views={[
        {
          id: 'test',
          sources: {
            ufs: {
              promoteId: 'codarea',
              type: 'geojson',
              data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=uf&formato=application/vnd.geo+json&qualidade=minima`,
            },
            municipios: {
              promoteId: 'codarea',
              type: 'geojson',
              data: `https://servicodados.ibge.gov.br/api/v4/malhas/paises/BR?intrarregiao=municipio&formato=application/vnd.geo+json&qualidade=minima`,
            },
          },
          layers: {
            ufs_boundaries: {
              interactive: true,
              type: 'line',
              source: 'ufs',
              paint: {
                // 'line-color': 'red',
                'line-color': ufColorExp,
                'line-opacity': 0.5,
                'line-width': 5,
              },
            },
            municipios_fill: {
              type: 'fill',
              source: 'municipios',
              paint: {
                'fill-color': municipioColorExp,
                'fill-opacity': 0.5,
                'fill-outline-color': 'red',
              },
            },
          },
        },
      ]}
    >
      <InspectControl />
    </LayeredMap>
  )
}
