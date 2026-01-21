//
// Este script exemplifica como é construída uma viewSpec
// que renderiza um indicador do censo 2022.
//
// No código para produção, as diversas etapas do script
// - confSchema
// - metadata
// - sources
// - layers
// - download
//
// Estão definidas em arquivos próprios para diferentes níveis
// de zoom e para diferentes tipos de malha (municípios, setores, buildings),
// o que torna a leitura e entendimento mais complexos.
//
// Este script exemplo serve como simplificação, ao reunir todas as etapas,
// permitindo uma compreensão global do sistema.
//
// A viewSpec está definida dentro da função `censo_2022_example_view`
// O código fora desta função é apenas código de setup do storybook
//

//
// Storybook dependencies
//
import { GeoReDUS } from './GeoReDUS'
import { versionedSearchParamsStateHook } from '@orioro/react-versioned-state'
import { useSearchParams, BrowserRouter } from 'react-router-dom'

//
// View spec dependencies
//
import { resolve, resolveAsync } from '@orioro/resolve'
import { COLOR_SCHEMES, downloadResolver } from '../viewSpecs/util'
import { dataJoin } from '@orioro/util'

//
// View spec definition
//
function censo_2022_example_view({
  VECTOR_TILE_SERVER_ENDPOINT,
  METADATA_API_ENDPOINT,
}) {
  const _layerFilter = resolve.fn((ctx) => {
    return [
      'all',
      //
      // cd_situacao = '9' -> Massas de água,
      // Não possui população nem domicílios
      //
      ['!', ['in', ['get', 'cd_situacao'], ['literal', ['9']]]],

      //
      // If regional is not active, only show data
      // on the municipio
      //
      ['==', ['get', 'cd_mun'], ctx.app.municipioId],

      //
      // Not all values from basico are empty.
      // TODO: move to backend
      //
      [
        '!',
        [
          'all',
          ['==', ['get', 'v0001'], 0],
          ['==', ['get', 'v0002'], 0],
          ['==', ['get', 'v0003'], 0],
          ['==', ['get', 'v0004'], 0],
          ['==', ['get', 'v0005'], 0],
          ['==', ['get', 'v0006'], 0],
          ['==', ['get', 'v0007'], 0],
        ],
      ],
    ]
  })

  return {
    collection_id: 'censo_2022_example_view',
    indicator_id: 'censo_2022_example_view',
    id: 'censo_2022_example_view',
    // sourceLabel: 'Fonte teste',
    label: 'População por faixa etária',
    path: `População e domicílios / / Demonstração`,
    confSchema: {
      data: {
        //
        // Define uma variável de configuração chamada "variableId"
        // A variableId, no nosso exemplo, define qual será a variável
        // carregada e renderizada
        //
        variableId: {
          type: 'treeSelect',
          label: 'Qual faixa etária?',
          options: [
            {
              path: '0 - 4',
              label: 'Total (0-4)',
              value: 'pop_bas_mor_tot_0_4_pct',
            },
            {
              path: '0 - 4',
              label: 'Meninas (0-4)',
              value: 'pop_bas_mor_sex_0_4_fem_pct',
            },
            {
              path: '0 - 4',
              label: 'Meninos (0-4)',
              value: 'pop_bas_mor_sex_0_4_mas_pct',
            },
            {
              label: 'pop_bas_mor_tot_5_9_pct',
              value: 'pop_bas_mor_tot_5_9_pct',
            },
            {
              label: 'pop_bas_mor_tot_10_14_pct',
              value: 'pop_bas_mor_tot_10_14_pct',
            },
          ],
          defaultValue: 'pop_bas_mor_tot_0_4_pct',
        },
      },
      style: {
        layerOpacity: {
          type: 'slider',
          label: 'Opacidade da camada',
          size: '1',
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.6,
        },
      },
    },
    metadata: resolveAsync.fn(async (ctx) => {
      //
      // Lê a variante a partir do objeto resultante da etapa de configurações
      //
      const variableId = ctx.view.conf.data.variableId

      //
      // Monta a URL para carregar os dados referente à variável
      // de todo o município
      //
      const dataUrl =
        // Monta a URL base para chamar a METADATA_API
        `${METADATA_API_ENDPOINT}/cem_censo_2022_pessoas?` +
        // Solicita carregar apenas dados do município selecionado
        `cd_mun=eq.${ctx.app.municipioId}&` +
        // Seleciona as colunas a serem carregadas para cada setor
        // censitário:
        // - id do setor
        // - variável
        // - ${variavel}_src
        `select=id,${variableId},${variableId}_src`

      //
      // Pode ser acessado de maneira independente, abra
      // o link no navegador para visualizar:
      //
      console.log('dataUrl', dataUrl)

      //
      // Faz a requisição ao servidor via fetch
      //
      const data = await fetch(dataUrl).then((res) => res.json())

      //
      // Obtém uma lista de valores (apenas números)
      // da variavel
      //
      const values = data
        .map((entry) => entry[variableId])
        .filter((value) => typeof value === 'number')

      //
      // Define o colorScheme como laranja
      //
      const colorScheme = COLOR_SCHEMES.schemeOranges

      return {
        //
        // Retorna a computação da escala de cores usando
        // algoritmo de quebras naturais
        //
        colorScaleStops: [
          '$naturalBreaks',
          values,
          {
            ...colorScheme,
            minK: 5,
          },
        ],
      }
    }),
    //
    // Define as fontes de dados
    //
    sources: {
      setores_censitarios: {
        minzoom: 8,
        //
        // Define uma fonte do tipo "vetorial"
        //
        type: 'vector',
        tiles: [
          resolve.fn((ctx) => {
            const variableId = ctx.view.conf.data.variableId

            //
            // Utilizando o protocolo vtx que:
            // 1. Carrega a malha vetorial de um tile (z/x/y)
            // 2. Carrega os dados referentes à exclusivamente um tile (z/x/y)
            // 3. Funde (join) dos dados da malha vetorial com os dados carregados
            // através do id
            //

            return [
              '$vtxUrl',
              {
                //
                // Link é definido para cada tile z/x/y.
                // Para acessar e visualizar conteúdo, substitua
                // variáveis z/x/y pelas coordenadas dos
                // tiles correspondentes
                //
                tiles: `${VECTOR_TILE_SERVER_ENDPOINT}/ibge_malha_br_setor_censitario_2022.geom/{z}/{x}/{y}`,

                //
                // Link é definido para cada tile z/x/y.
                // Para acessar e visualizar conteúdo, substitua
                // variáveis z/x/y pelas coordenadas dos
                // tiles correspondentes
                //
                data: [
                  [
                    'id',
                    `${METADATA_API_ENDPOINT}/rpc/cem_censo_2022_data_tile?` +
                      `table_id=cem_censo_2022_pessoas&` +
                      `variable_id=${variableId}&` +
                      `z={z}&x={x}&y={y}`,
                  ],
                ],
              },
            ]
          }),
        ],
      },
    },
    layers: {
      //
      // Define uma layer que renderiza apenas as linhas divisórias
      // dos setores censitários
      //
      setores_censitarios_bounds: {
        filter: _layerFilter,
        zIndex: 99999999999,
        type: 'line',
        source: 'setores_censitarios',
        'source-layer': 'ibge_malha_br_setor_censitario_2022.geom',
        minzoom: 13,
      },

      //
      // Define uma layer que renderiza apenas o preenchimento (fill)
      // dos setores censitários
      //
      setores_censitarios_fill: {
        filter: _layerFilter,
        type: 'fill',
        source: 'setores_censitarios',
        'source-layer': 'ibge_malha_br_setor_censitario_2022.geom',
        paint: {
          //
          // Define que a cor deverá usar uma escala fixa definida em
          // view.metadata.colorScaleStops
          //
          'fill-color': resolve.fn((ctx) => {
            const colorExp = [
              // 'step' = escala fixa de cores
              'step',
              // Tenta obter o valor da primeira expressão ['get', 'value'],
              // caso o valor seja null, use -1 como valor base (para deixar em cinza os valores nulos)
              ['coalesce', ['get', 'value'], -1],
              ...ctx.view.metadata.colorScaleStops,
            ]

            return colorExp
          }),
          'fill-opacity': ['$get', 'view.conf.style.layerOpacity'],
          'fill-outline-color': 'transparent',
        },

        //
        // Define as legendas
        //
        legends: [
          {
            type: 'SequentialColorLegend',
            //
            // Usa o nome da variável como título da legenda
            //
            title: resolve.fn((ctx) => ctx.view.conf.data.variableId),

            //
            // Usa as cores definidas na etapa de metadata como cores
            // da legenda
            //
            steps: resolve.fn((ctx) => {
              return ctx.view.metadata.colorScaleStops
            }),
          },
        ],

        tooltip: {
          title: [
            //
            // $literal é obrigatório pois previne a resolução
            // antecipada da expressão. Para ser possível
            // ler dados da feature em que o cursor está
            // sobre, é preciso que a resolução da expressão aguarde
            // a conclusão da renderização do mapa (diferentemente das
            // outras expressões definidas na view)
            //
            '$literal',
            [
              '$template',
              'Setor censitário ${0}',
              ['$get', 'feature.properties.id'],
            ],
          ],

          entries: [
            '$literal',
            //
            // Resolve os pares de chave-valor da lista de dados de um tooltip.
            // O formato de "entries" deve ser:
            // [
            //   ["Chave 1", "Valor 1"],
            //   ["Chave 2", 123],
            //   ["Chave 3", 456]
            // ]
            //
            // Isso renderiza um tooltip com a seguinte lista:
            // - Chave 1: Valor 1
            // - Chave 2: 123
            // - Chave 3: 456
            //
            resolve.fn((ctx) => {
              return [
                [
                  'Valor',
                  new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                  }).format(ctx.feature?.properties?.value),
                ],
                ['Valor src', ctx.feature?.properties?.value_src],
              ]
            }),
          ],
        },
      },
    },

    //
    // Define a função de download de dados
    //
    download: downloadResolver({
      //
      // Nome do arquivo
      //
      fileNameBase: [
        '$template',
        '${0}_${1}_georedus_censo_${2}',
        [
          ['$get', 'view.conf.data.variableId'],
          ['$get', 'municipioId'],
          '2022',
        ],
      ],

      //
      // Nome da variável
      //
      mainVariableId: ['$get', 'view.conf.data.variableId'],

      //
      // Variáveis disponíveis para download
      //
      availableVariableIds: [],

      //
      // Função para carregamento de dados
      //
      fetchData: resolve.fn((ctx) => async ({ variableIds, options }) => {
        const variableId = ctx.view.conf.data.variableId
        // const value_src = ctx.feature.properties.value_src
        console.log(ctx)
        //
        // Monta a URL para carregar os dados referente à variável
        // de todo o município
        //
        const dataUrl =
          // Monta a URL base para chamar a METADATA_API
          `${METADATA_API_ENDPOINT}/cem_censo_2022_pessoas?` +
          // Solicita carregar apenas dados do município selecionado
          `cd_mun=eq.${ctx.app.municipioId}&` +
          // Seleciona as colunas a serem carregadas para cada setor
          // censitário:
          // - id do setor
          // - variável
          // - ${variavel}_src
          `select=id,${variableId},${variableId}_src`

        const data = await fetch(dataUrl).then((res) => res.json())

        if (options.format === 'CSV') {
          //
          // No need to load geometries
          //
          return data
        }

        const geometriesUrl =
          // Monta a URL base para chamar a METADATA_API
          `${METADATA_API_ENDPOINT}/ibge_malha_br_setor_censitario_2022?` +
          // Solicita carregar apenas dados do município selecionado
          `cd_mun=eq.${ctx.app.municipioId}&` +
          // Seleciona id (do setor) e geometria
          `select=id,geom`

        const geometries = await fetch(geometriesUrl).then((res) => res.json())

        return dataJoin([geometries, data], {
          key: 'id',
        })
      }),
    }),
  }
}

//
// Storybook export
//
export default {
  title: 'GeoReDUS / censo_2022_example_view',
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
}

const VIEW_SPECS = {
  all: [
    [
      censo_2022_example_view({
        ...API,
      }),
    ],
  ],
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

export const Basic = () => {
  const [stateStorage, setStateStorage] = useVersionedSearchParamsState(
    {},
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
      mapProps={{
        onStyleData: (evt) => {
          evt.target.showTileBoundaries = true
        },
      }}
    />
  )
}
