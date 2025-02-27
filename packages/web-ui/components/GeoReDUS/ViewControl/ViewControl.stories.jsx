import { Debug, Flex } from '@orioro/react-ui-core'
import { ViewControl } from './ViewControl'
import { useState } from 'react'
import { omit } from 'lodash'

export default {
  title: 'GeoReDUS / ViewControl',
}

const METODOLOGY_TEXT = `
Lift($$L$$) can be determined by Lift Coefficient ($$C_L$$) like the following
equation.

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$
`

const METODOLOGY_URL = 'https://raw.githubusercontent.com/remarkjs/remark-math/refs/heads/main/readme.md'

export const Basic = () => {
  const [activeViewsById, setActiveViewsById] = useState({})

  const viewId = 'cem_censo_2022_alf'
  return (
    <Flex
      direction="column"
      gap="3"
      width="350px"
      p="4"
      style={{
        backgroundColor: 'var(--accent-3)',
      }}
    >
      <ViewControl
        viewConf={activeViewsById[viewId]}
        onDeactivateView={() =>
          setActiveViewsById(omit(activeViewsById, [viewId]))
        }
        onSetView={(nextViewConf) =>
          setActiveViewsById({
            ...activeViewsById,
            [viewId]: nextViewConf,
          })
        }
        viewSpec={{
          id: viewId,
          label: 'Pessoas alfabetizadas entre 10 e 14 anos',
          sourceLabel: 'Censo 2022',
          // metodology: METODOLOGY_TEXT,
          metodology: METODOLOGY_URL,
          conf: {
            data: {
              variableId: {
                label: 'Recorte',
                placeholder: 'Selecione um recorte',
                clearable: false,
                type: 'treeSelect',
                defaultValue: 'pop_alf_mor_tot_10_14_pct',
                options: [
                  {
                    label: 'Total',
                    value: 'pop_alf_mor_tot_10_14_pct',
                  },
                  {
                    path: 'Sexo',
                    label: 'Homem',
                    value: 'pop_alf_mor_sex_10_14_mas_pct',
                  },
                  {
                    path: 'Sexo',
                    label: 'Mulher',
                    value: 'pop_alf_mor_sex_10_14_mas',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Homens negros',
                    value: 'pop_alf_mor_cor_sex_10_14_neg_mas',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Mulheres negras',
                    value: 'pop_alf_mor_cor_sex_10_14_neg_fem',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Homens indígenas',
                    value: 'pop_alf_mor_cor_sex_10_14_ind_mas',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Mulheres indígenas',
                    value: 'pop_alf_mor_cor_sex_10_14_ind_fem',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Homens brancos',
                    value: 'pop_alf_mor_cor_sex_10_14_bra_mas',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Mulheres brancas',
                    value: 'pop_alf_mor_cor_sex_10_14_bra_fem',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Homens amarelos',
                    value: 'pop_alf_mor_cor_sex_10_14_ama_mas',
                  },
                  {
                    path: 'Sexo + Cor',
                    label: 'Mulheres amarelas',
                    value: 'pop_alf_mor_cor_sex_10_14_ama_fem',
                  },
                  {
                    path: 'Cor',
                    label: 'Pessoas negras',
                    value: 'pop_alf_mor_cor_10_14_neg',
                  },
                  {
                    path: 'Cor',
                    label: 'Pessoas indígenas',
                    value: 'pop_alf_mor_cor_10_14_ind',
                  },
                  {
                    path: 'Cor',
                    label: 'Pessoas brancas',
                    value: 'pop_alf_mor_cor_10_14_bra',
                  },
                  {
                    path: 'Cor',
                    label: 'Pessoas amarelas',
                    value: 'pop_alf_mor_cor_10_14_ama',
                  },
                ],
              },
              grid: {
                label: 'Modo de visualização',
                type: 'radioSelect',
                defaultValue: 'setores_censitarios',
                options: [
                  {
                    value: 'hexagonos',
                    label:
                      'Malha hexagonal (pessoas residentes por unidade territorial)',
                  },
                  {
                    value: 'setores_censitarios',
                    label: 'Malha de setores censitários (densidade hab/km2)',
                  },
                ],
              },
            },
            style: {
              opacity: {
                defaultValue: 0.5,
                label: 'Opacidade',
                type: 'slider',
                size: '1',
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
          },
        }}
      />

      <Debug data={{ activeViewsById }} />
    </Flex>
  )
}
