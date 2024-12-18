import { Flex, Input } from '@orioro/react-ui-core'
import { LayerMenu } from '../LayerMenu'
import { useEffect, useMemo, useState } from 'react'
import { LayeredMap } from '../LayeredMap'

import { bbox, center, centroid } from '@turf/turf'

export function GeoReDUS() {
  const [activeTabId, setActiveTabId] = useState(
    'populacao-e-domicilios',
  )
  const [activeLayers, setActiveLayers] = useState([])

  const [municipio, setMunicipio] = useState('1501402')

  // const [initialViewState, setInitialViewState] = useState({})

  const [viewState, setViewState] = useState({
    longitude: -48.503887,
    latitude: -1.455833,
    zoom: 13,
  })

  useEffect(() => {
    async function setCenter() {
      const data = await fetch(
        `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${municipio}?qualidade=minima&formato=application/vnd.geo+json`,
      ).then((r) => r.json())

      const center = centroid(data)

      setViewState({
        longitude: center.geometry.coordinates[0],
        latitude: center.geometry.coordinates[1],
        zoom: 10,
      })
    }

    setCenter()
  }, [municipio])

  return (
    <Flex>
      <LayerMenu
        activeTabId={activeTabId}
        onSetActiveTabId={setActiveTabId}
        activeLayers={activeLayers}
        onSetActiveLayers={setActiveLayers}
        style={{
          width: 400,
          position: 'fixed',
          zIndex: 2,
          top: 10,
          left: 10,
          bottom: 10,
        }}
      />

      <Flex
        style={{
          width: '400px',
          position: 'fixed',
          zIndex: 2,
          right: '10px',
          top: '10px',
        }}
        alignItems="stretch"
      >
        <Input
          schema={{
            type: 'select',
            options: async () => {
              const municipios = await fetch(
                'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado',
              ).then((response) => response.json())

              return municipios.map((mun) => ({
                label: `${mun['municipio-nome']} (${mun['UF-sigla']})`,
                value: mun['municipio-id'] + '',
              }))
            },
          }}
          value={municipio}
          onSetValue={setMunicipio}
        />
      </Flex>
      <LayeredMap
        initialViewState={viewState}
        layers={activeLayers.map((activeLayer) => ({
          id: `${municipio}_${activeLayer.id}`,
          type: 'sequential_choropleth',
          property: activeLayer.id,
          label: activeLayer.label,
          mapLayerFeaturesWhere: {
            mapLayer: {
              id: {
                equals: 'a141eb25-94e7-4351-b083-024f650c0b05',
              },
            },
            properties: {
              indexSchema: {
                string_0: 'cd_geocodi', // id
                string_1: 'cd_geocods', // cod_subdistrito
                string_2: 'cod_distrito',
                string_3: 'cod_bairro',
                string_4: 'cod_municipio',
                string_5: 'cod_uf',
                string_6: 'tipo',
              },
              value: {
                cod_municipio: municipio,
              },
            },
          },
        }))}
        // layers={['1501402', '1500800'].map((cod_municipio) => ({
        //   id: cod_municipio,
        //   type: 'sequential_choropleth',
        //   property: 'ent_esg_mor_tot_dom',
        //   label: 'Presença de esgotamento a céu aberto',
        //   mapLayerFeaturesWhere: {
        //     mapLayer: {
        //       id: {
        //         equals: 'a141eb25-94e7-4351-b083-024f650c0b05',
        //       },
        //     },
        //     properties: {
        //       indexSchema: {
        //         string_0: 'cd_geocodi', // id
        //         string_1: 'cd_geocods', // cod_subdistrito
        //         string_2: 'cod_distrito',
        //         string_3: 'cod_bairro',
        //         string_4: 'cod_municipio',
        //         string_5: 'cod_uf',
        //         string_6: 'tipo',
        //       },
        //       value: {
        //         cod_municipio: cod_municipio,
        //       },
        //     },
        //   },
        // }))}
      />
    </Flex>
  )
}
