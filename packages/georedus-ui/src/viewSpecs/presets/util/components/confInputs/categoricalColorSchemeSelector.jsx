import { Flex } from '@orioro/react-ui-core'
import {
  GEOREDUS_LABELED_COLORS,
  GEOREDUS_LABELED_SAFE_COLORS,
  D3_CATEGORICAL,
} from '../../../../util/colorSchemes'

const GEOREDUS_CATEGORICAL_SAFE_COLORS = Object.values(
  GEOREDUS_LABELED_SAFE_COLORS,
).map((color) => color.value)

const GEOREDUS_CATEGORICAL_COLORS = Object.values(GEOREDUS_LABELED_COLORS).map(
  (color) => color.value,
)

const CATEGORICAL_SCHEMES = {
  schemeGeoReDUSSafe: GEOREDUS_CATEGORICAL_SAFE_COLORS,
  schemeGeoReDUS: GEOREDUS_CATEGORICAL_COLORS,
  ...D3_CATEGORICAL,
}

export function categoricalColorSchemeSelector({
  //TODO: Existem camadas com cores customizadas que não se encaixam nos schemas pré-definidos
  // o clearable possibilita que  usuário limpe um schema selecionado e retorne para as cores origiais da camada
  // idealmente deveríamos construir um schema com as cores originais e inserir na lista de schemas
  clearable = false,
  defaultValue = 'schemeGeoReDUSSafe',
}) {
  return {
    label: 'Esquema de cores',
    type: 'select',
    clearable,
    defaultValue,
    options: Object.entries(CATEGORICAL_SCHEMES).map(([name, scheme]) => {
      return {
        value: name,
        label: (
          <Flex direction="row" gap="2" alignItems="center">
            <div style={{ display: 'flex', gap: '2px' }}>
              {scheme.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: color,
                    border: 'none',
                  }}
                />
              ))}
            </div>
          </Flex>
        ),
      }
    }),
  }
}
