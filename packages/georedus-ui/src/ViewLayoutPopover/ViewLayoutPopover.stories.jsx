import { useReducer } from 'react'
import { ViewLayoutControl } from './ViewLayoutControl'
import { ViewLayoutPopover } from './ViewLayoutPopover'
import {
  viewConfReducer,
  viewConfReducerInitialState,
} from '../GeoReDUS/viewConfReducer'

export default {
  title: 'GeoReDUS / ViewLayoutPopover',
}

export const Basic = () => {
  const [viewConfState, viewConfDispatch] = useReducer(
    viewConfReducer,
    {
      byId: {
        'ibge_malha_br_setor_censitario_2010.pop_alf_mor_tot_10_14_pct': {
          data: {
            variableId: 'pop_alf_mor_tot_10_14_pct',
          },
          style: {
            layerOpacity: 0.6,
          },
          id: 'ibge_malha_br_setor_censitario_2010.pop_alf_mor_tot_10_14_pct',
        },
        'ibge_malha_br_setor_censitario_2010.dom_bas_dom_tot_imp_pct': {
          data: {
            variableId: 'dom_bas_dom_tot_imp_pct',
          },
          style: {
            layerOpacity: 0.6,
          },
          id: 'ibge_malha_br_setor_censitario_2010.dom_bas_dom_tot_imp_pct',
        },
      },
      layout: [
        {
          id: 'left',
          items: [
            {
              id: 'ibge_malha_br_setor_censitario_2010.pop_alf_mor_tot_10_14_pct',
            },
          ],
        },
        {
          id: 'right',
          items: [
            {
              id: 'ibge_malha_br_setor_censitario_2010.dom_bas_dom_tot_imp_pct',
            },
          ],
        },
      ],
    },
    // viewConfReducerInitialState,
  )

  return (
    <ViewLayoutPopover
      viewSpecs={[
        {
          id: 'ibge_malha_br_setor_censitario_2010.pop_alf_mor_tot_10_14_pct',
          label: 'Pessoas alfabetizadas entre 10 e 14 anos',
          sourceLabel: 'CENSO 2010',
        },
        {
          id: 'ibge_malha_br_setor_censitario_2010.dom_bas_dom_tot_imp_pct',
          label: 'Domicílios improvisados',
          sourceLabel: 'CENSO 2010',
        },
      ]}
      viewConfState={viewConfState}
      viewConfDispatch={viewConfDispatch}
    />
  )
}
