import React from 'react'
import { resolve } from '@orioro/resolve'
import { Z_OVERLAY_MIDDLE_2000 } from '../zIndexes'
import { schemeCategory10 } from 'd3-scale-chromatic'
import {
  AspectRatio,
  Box,
  EvenSpacedList,
  Flex,
  RichText,
  RichTextOutput,
  FileOutput,
  color,
  LoadingIndicator,
} from '@orioro/react-ui-core'
import { Badge, Heading, Portal } from '@radix-ui/themes'
import styled from 'styled-components'
import {
  mdiAccountMultipleOutline,
  mdiCurrencyUsd,
  mdiScaleBalance,
  mdiSprout,
  mdiTree,
} from '@mdi/js'
import { Icon } from '@mdi/react'
import { useState } from 'react'

import Confetti from 'react-confetti'

const AutoWrapContainer = styled.div`
  display: flex;
  direction: row;
  flex-wrap: wrap;
  margin-left: -10px;
  margin-top: -10px;

  > * {
    margin-left: 10px;
    margin-top: 10px;
  }
`

const UnstyledList = styled.ul`
  margin: 0;
`

const REDUS_MUTIRAO_COP_2025_ID = 'redus_mutirao_cop_2025.geom'

const URL_RE = /^https?:\/\//

function _ensureUrl(url) {
  if (!url) {
    return ''
  }

  return URL_RE.test(url) ? url : `https://${url}`
}

function AsyncImage({ src }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <AspectRatio ratio={16 / 9}>
        <img
          src={src}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          style={{
            display: loaded ? 'block' : 'none',
            maxWidth: '100%',
          }}
        />
      </AspectRatio>
      {!loaded && (
        <LoadingIndicator
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  )
}

const MITIGACAO =
  'Mitigação – energias renováveis, eficiência energética, mobilidade sustentável, construções verdes, redução de emissões'
const ADAPTACAO =
  'Adaptação – resiliência climática, gestão da água, reflorestamento, agricultura sustentável, saúde, nutrição'
const FINANCIAMENTO =
  'Financiamento climático – bioeconomia, finanças sustentáveis, empreendedorismo climático, compras públicas verdes'
const GOVERNANCA =
  'Governança – políticas públicas, governança multinível, inovação digital, participação social, fortalecimento institucional'
const JUSTICA_CLIMATICA =
  'Justiça climática – direito à cidade, moradia digna, cultura e povos tradicionais, redução de desigualdades, segurança alimentar'
const OUTRO = 'Outro'

const LEGEND_ITEMS = [
  {
    label: 'Mitigação',
    value: MITIGACAO,
    color: schemeCategory10[8],
    iconPath: mdiSprout,
    icon: 'mdiSprout({fill:"white"})',
  },
  {
    label: 'Adaptação',
    value: ADAPTACAO,
    color: schemeCategory10[2],
    iconPath: mdiTree,
    icon: 'mdiTree({fill:"white"})',
  },
  {
    label: 'Financiamento',
    value: FINANCIAMENTO,
    color: schemeCategory10[9],
    iconPath: mdiCurrencyUsd,
    icon: 'mdiCurrencyUsd({fill:"white"})',
  },
  {
    label: 'Governança',
    value: GOVERNANCA,
    color: schemeCategory10[0],
    iconPath: mdiAccountMultipleOutline,
    icon: 'mdiAccountMultipleOutline({fill:"white"})',
  },
  {
    label: 'Justiça climática',
    value: JUSTICA_CLIMATICA,
    color: schemeCategory10[1],
    iconPath: mdiScaleBalance,
    icon: 'mdiScaleBalance({fill:"white"})',
  },
  {
    label: 'Outro',
    value: OUTRO,
    color: schemeCategory10[7],
    iconPath: null,
    icon: 'none',
  },
]

function _eixoShortLabel(value) {
  return LEGEND_ITEMS.find((item) => item.value === value)?.label || 'Outro'
}

export function redus_mutirao_cop_2025(conf) {
  const { VECTOR_TILE_SERVER_ENDPOINT } = conf

  return {
    collection_id: REDUS_MUTIRAO_COP_2025_ID,
    indicator_id: REDUS_MUTIRAO_COP_2025_ID,
    id: REDUS_MUTIRAO_COP_2025_ID,
    label: 'Mutirão ReDUS COP30',
    path: `Emergências Climáticas / _ / COP30`,
    metadata: {},

    sources: {
      [REDUS_MUTIRAO_COP_2025_ID]: {
        type: 'vector',
        minzoom: 3,
        tiles: [
          `${VECTOR_TILE_SERVER_ENDPOINT}/${REDUS_MUTIRAO_COP_2025_ID}/{z}/{x}/{y}`,
        ],
      },
    },
    layers: {
      [`${REDUS_MUTIRAO_COP_2025_ID}_symbols`]: {
        type: 'symbol',
        source: REDUS_MUTIRAO_COP_2025_ID,
        zIndex: Z_OVERLAY_MIDDLE_2000 + 1,
        'source-layer': REDUS_MUTIRAO_COP_2025_ID,
        minzoom: 3,
        layout: {
          'icon-image': [
            'match',
            ['get', 'eixos_cop_30_primeiro'],
            ...LEGEND_ITEMS.map((item) => [
              item.value,
              ['literal', item.icon],
            ]).flat(),

            // default:
            'none',
          ],
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            0.5, // at zoom 5 → radius 0.5
            15,
            0.8, // at zoom 15 → radius 0.8
          ],
        },
      },
      [`${REDUS_MUTIRAO_COP_2025_ID}_circles`]: {
        zIndex: Z_OVERLAY_MIDDLE_2000,
        source: REDUS_MUTIRAO_COP_2025_ID,
        'source-layer': REDUS_MUTIRAO_COP_2025_ID,
        minzoom: 3,
        type: 'circle',
        paint: {
          'circle-opacity': 1,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            10, // at zoom 5 → radius 10
            15,
            15, // at zoom 15 → radius 15
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000',
          // 'circle-color': '#3E63DD',
          'circle-color': [
            'match',
            ['get', 'eixos_cop_30_primeiro'],
            ...LEGEND_ITEMS.map((item) => [item.value, item.color]).flat(),
            // default
            schemeCategory10[7],
          ],
        },

        interactive: true,
        onClick: async (feature, e, context) => {
          const properties = feature.properties

          await context.dialogs.view(
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Heading as="h1" size="6">
                  {properties.name}
                </Heading>

                <Portal>
                  <Confetti
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      zIndex: 9999,
                    }}
                    recycle={false}
                    numberOfPieces={700}
                    tweenDuration={8000}
                  />
                </Portal>

                {(properties.eixos_cop_30_text || properties.odus_text) && (
                  <div>
                    <AutoWrapContainer>
                      {JSON.parse(properties.eixos_cop_30_text).map(
                        (eixo, idx) => (
                          <Badge color="green" key={idx}>
                            {_eixoShortLabel(eixo)}
                          </Badge>
                        ),
                      )}
                      {JSON.parse(properties.odus_text).map((obj, idx) => (
                        <Badge key={idx}>{obj}</Badge>
                      ))}
                    </AutoWrapContainer>
                  </div>
                )}

                <Heading
                  as="h3"
                  size="2"
                  style={{
                    fontWeight: 'normal',
                  }}
                >
                  Organização responsável:{' '}
                  <strong>{properties.organizacao}</strong>
                </Heading>
                {properties.parcerias && (
                  <Heading
                    as="h3"
                    size="2"
                    style={{
                      fontWeight: 'normal',
                    }}
                  >
                    Em parceria com: <strong>{properties.parcerias}</strong>
                  </Heading>
                )}

                <Heading
                  as="h3"
                  size="2"
                  style={{
                    fontWeight: 'normal',
                  }}
                >
                  Cidade:{' '}
                  <strong>
                    {properties.cidade} - {properties.estado}
                  </strong>
                </Heading>
              </Flex>

              {properties.cover_image && (
                <Box>
                  <img
                    style={{
                      maxWidth: '100%',
                    }}
                    src={properties.cover_image}
                  />
                </Box>
              )}

              {properties.descricao_text && (
                <Flex gap="2">
                  <Heading size="3">Descrição:</Heading>
                  <RichTextOutput
                    value={JSON.parse(properties.descricao_text)}
                  />
                </Flex>
              )}

              {properties.impacto_text && (
                <Flex gap="2">
                  <Heading size="3">Impacto:</Heading>
                  <RichTextOutput value={JSON.parse(properties.impacto_text)} />
                </Flex>
              )}

              {properties.escala_de_atuacao_text && (
                <Flex gap="2">
                  <Heading size="3">Escala de atuação:</Heading>

                  <div>
                    <UnstyledList>
                      {JSON.parse(properties.escala_de_atuacao_text).map(
                        (escala, idx) => (
                          <li key={idx}>{escala}</li>
                        ),
                      )}
                    </UnstyledList>
                  </div>
                </Flex>
              )}

              {properties.fase_text && (
                <Flex gap="2">
                  <Heading size="3">Fase:</Heading>

                  <div>
                    <UnstyledList>
                      {JSON.parse(properties.fase_text).map((fase, idx) => (
                        <li key={idx}>{fase}</li>
                      ))}
                    </UnstyledList>
                  </div>
                </Flex>
              )}

              <Flex gap="2">
                <Heading size="3">Informações de contato:</Heading>

                <div>
                  <UnstyledList>
                    {_ensureUrl(properties.site) && (
                      <li>
                        Site:{' '}
                        <a
                          href={_ensureUrl(properties.site)}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {_ensureUrl(properties.site)}
                        </a>
                      </li>
                    )}
                    {properties.redes_sociais && (
                      <li>Redes sociais: {properties.redes_sociais}</li>
                    )}
                    {properties.email && (
                      <li>
                        E-mail:{' '}
                        <a href={`mailto:${properties.email}`}>
                          {properties.email}
                        </a>
                      </li>
                    )}
                  </UnstyledList>
                </div>
              </Flex>

              {properties.other_attachments_text && (
                <Flex gap="2">
                  <Heading size="3">Mais informações:</Heading>

                  <EvenSpacedList columns={2} gap="3">
                    {JSON.parse(properties.other_attachments_text).map(
                      (fase, idx) => (
                        <FileOutput value={fase} key={idx} />
                      ),
                    )}
                  </EvenSpacedList>
                </Flex>
              )}
            </Flex>,
          )
        },

        tooltip: {
          title: resolve.literal(
            resolve.fn(({ feature }) => {
              const eixo =
                LEGEND_ITEMS.find(
                  (item) =>
                    item.value === feature?.properties?.eixos_cop_30_primeiro,
                ) || null

              return (
                <div
                  style={{
                    display: 'inline-flex',
                  }}
                >
                  {eixo && (
                    <Icon
                      path={eixo.iconPath}
                      size="18px"
                      style={{
                        flexGrow: 0,
                        flexShrink: 0,
                        marginRight: 5,
                      }}
                      color="white"
                    />
                  )}
                  {`${eixo?.label}: ${feature?.properties?.name}`}
                </div>
              )
            }),
          ),
          // title: ['$literal', ['$get', 'feature.properties.name']],
          entries: [
            [
              'Organização',
              ['$literal', ['$get', 'feature.properties.organizacao']],
            ],
            resolve.literal(
              resolve.fn(({ feature }) => {
                return feature.properties?.parcerias
                  ? ['Parcerias', feature.properties?.parcerias]
                  : null
              }),
            ),
            resolve.literal(
              resolve.fn(({ feature }) => {
                return feature.properties.cover_image
                  ? [
                      null,
                      <AsyncImage
                        style={{
                          maxWidth: '100%',
                        }}
                        src={feature.properties.cover_image}
                      />,
                    ]
                  : null
              }),
            ),
          ].filter(Boolean),
        },

        legends: [
          {
            type: 'CategoricalLegend',
            title: 'Eixos de atuação',
            unit: 'Eixos de atuação da COP30',
            items: LEGEND_ITEMS.map((item) => ({
              ...item,
              box: {
                children: item.iconPath && (
                  <Icon path={item.iconPath} size="14px" color="white" />
                ),
                style: {
                  borderRadius: '100%',
                  borderColor: '#000000',
                },
              },
            })),
          },
        ],
      },
    },
  }
}
