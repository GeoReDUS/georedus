import { Flex } from '@orioro/react-ui-core'

export const COLOR_OPTIONS = [
  { label: 'Azul Claro', value: '#a6cee3' },
  { label: 'Azul', value: '#1f78b4' },
  { label: 'Verde Claro', value: '#b2df8a' },
  { label: 'Verde', value: '#33a02c' },
  { label: 'Vermelho Claro', value: '#fb9a99' },
  { label: 'Vermelho', value: '#e31a1c' },
  { label: 'Laranja Claro', value: '#fdbf6f' },
  { label: 'Laranja', value: '#ff7f00' },
  { label: 'Roxo Claro', value: '#cab2d6' },
  { label: 'Roxo', value: '#6a3d9a' },
  { label: 'Amarelo Claro', value: '#ffff99' },
  { label: 'Marrom', value: '#b15928' },
]

export function getColorOptions(_initialColor) {
  return {
    label: 'Cor',
    helperText: 'Selecione a cor para a camada',
    type: 'select',
    clearable: false,
    defaultValue: _initialColor,
    options: COLOR_OPTIONS.map((opt) => ({
      ...opt,
      label: (
        <Flex direction="row" alignItems="center" gap="2">
          <div
            style={{
              width: '15px',
              height: '15px',
              backgroundColor: opt.value,
            }}
          />
          <div>{opt.label}</div>
        </Flex>
      ),
    })),
  }
}
