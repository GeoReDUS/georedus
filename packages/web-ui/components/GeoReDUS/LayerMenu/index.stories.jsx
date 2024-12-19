import { useState } from 'react'
import { LayerMenu } from '.'

import { Icon } from '@mdi/react'
import { mdiAccountGroup, mdiDomain, mdiHospitalBox, mdiSchool } from '@mdi/js'
import LAYERS from './layers.json'
import slugify from '@sindresorhus/slugify'
import { Debug, Flex } from '@orioro/react-ui-core'

export default {
  title: 'GeoReDUS / LayerMenu',
}

function _layers(path) {
  return LAYERS.filter((layer) => layer.path === path)
}

export const Basic = () => {
  const [activeTabId, setActiveTabId] = useState(
    'infraestrutura-e-servicos-urbanos',
  )
  const [activeLayers, setActiveLayers] = useState([])

  return (
    <Flex direction="row" childOnlyGap="4">
      <div
        style={{
          width: 400,
        }}
      >
        <LayerMenu
          activeTabId={activeTabId}
          onSetActiveTabId={setActiveTabId}
          activeLayers={activeLayers}
          onSetActiveLayers={setActiveLayers}
          // tabs={[
          //   {
          //     id: 'infraestrutura-e-servicos-urbanos',
          //     label: 'Infraestrutura e serviços urbanos',
          //     icon: <Icon path={mdiDomain} />,
          //     nodes: [
          //       {
          //         id: 'entorno',
          //         label: 'Entorno',
          //         layers: _layers('infraestrutura-e-servicos-urbanos/entorno'),
          //       },
          //       {
          //         id: 'servicos-urbanos',
          //         label: 'Serviços urbanos',
          //         layers: _layers(
          //           'infraestrutura-e-servicos-urbanos/servicos-urbanos',
          //         ),
          //       },
          //       {
          //         id: 'sistema-viario',
          //         label: 'Sistema viário',
          //         layers: _layers(
          //           'infraestrutura-e-servicos-urbanos/sistema-viario',
          //         ),
          //       },
          //     ],
          //   },
          //   {
          //     id: 'populacao-e-domicilios',
          //     label: 'População e domicílios',
          //     icon: <Icon path={mdiAccountGroup} />,
          //     nodes: [
          //       {
          //         id: 'alfabetizacao',
          //         label: 'Alfabetização',
          //         layers: _layers('populacao-e-domicilios/alfabetizacao'),
          //       },
          //       {
          //         id: 'densidade-e-rendimento',
          //         label: 'Densidade e rendimento',
          //         layers: _layers(
          //           'populacao-e-domicilios/densidade-e-rendimento',
          //         ),
          //       },
          //       {
          //         id: 'populacao',
          //         label: 'População',
          //         layers: _layers('populacao-e-domicilios/populacao'),
          //       },
          //       {
          //         id: 'populacao-por-faixa-etaria',
          //         label: 'População por faixa etária',
          //         layers: _layers(
          //           'populacao-e-domicilios/populacao-por-faixa-etaria',
          //         ),
          //       },
          //       {
          //         id: 'posse-e-tipo-dos-domicilios',
          //         label: 'Posse e tipo dos domicílios',
          //         layers: _layers(
          //           'populacao-e-domicilios/posse-e-tipo-dos-domicilios',
          //         ),
          //       },
          //     ],
          //   },
          //   {
          //     id: 'educacao',
          //     icon: <Icon path={mdiSchool} />,
          //     label: 'Educação',

          //     nodes: [
          //       'Ensino Infantil',
          //       'Ensino Fundamental',
          //       'Ensino Médio',
          //     ].map((label) => ({
          //       label,
          //       id: slugify(label),
          //       children: [
          //         {
          //           id: 'demanda',
          //           label: 'Demanda',
          //           layers: _layers(`educacao/${slugify(label)}/demanda`),
          //         },
          //         {
          //           id: 'qualidade',
          //           label: 'Qualidade',
          //           layers: _layers(`educacao/${slugify(label)}/qualidade`),
          //         },
          //       ],
          //     })),
          //   },
          //   {
          //     id: 'saude',
          //     icon: <Icon path={mdiHospitalBox} />,
          //     label: 'Saúde',
          //     nodes: [],
          //   },
          // ]}
        />
      </div>
      <Debug data={activeLayers} />
    </Flex>
  )
}
