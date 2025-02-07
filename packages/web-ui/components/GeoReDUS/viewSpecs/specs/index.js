import LAYERS_BASE from '../../LayerMenu/layers.json'
import * as PRESETS from '../presets'

const VIEW_SPECS = [
  ...LAYERS_BASE.flatMap((layer) =>
    [layer.id, layer.variants?.options?.map((option) => option.id)].filter(
      Boolean,
    ),
  ).map((layerId) =>
    PRESETS.cem_censo_2010({
      variableId: `${layerId}_pct`,
    }),
  ),
  // PRESETS.cem_censo_2010({
  //   variableId: 'pop_alf_mor_tot_10_14_pct',
  // }),
  PRESETS.cem_educacao_escolas_2022({
    variableId: 'ideb_fund_ai',
  }),
]

export const VIEW_SPECS_BY_ID = VIEW_SPECS.reduce(
  (acc, view) =>
    Array.isArray(view)
      ? {
          ...acc,
          [view[0]]: view[1],
        }
      : {
          ...acc,
          [view.id]: view,
        },
  {},
)

console.log(VIEW_SPECS_BY_ID)
