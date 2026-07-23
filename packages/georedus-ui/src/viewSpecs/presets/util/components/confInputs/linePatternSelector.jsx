import { Flex } from '@orioro/react-ui-core'

export const LINE_PATTERN_SOLID = 'solid'

export const LINE_PATTERN_OPTIONS = [
  { label: 'Sólido', value: 'solid' },
  { label: 'Tracejado', value: 'dashed' },
  { label: 'Pontilhado', value: 'dotted' },
]

export function linePatternSelector({
  defaultValue = LINE_PATTERN_SOLID,
} = {}) {
  return {
    label: 'Padrão da linha',
    helperText: 'Selecione o padrão de linha para a camada',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue,
    options: LINE_PATTERN_OPTIONS.map((opt) => {
      return {
        ...opt,
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: 15,
                height: 0,
                borderTop: `2px ${opt.value} black`,
              }}
            />
            <div> {opt.label}</div>
          </Flex>
        ),
      }
    }),
  }
}
