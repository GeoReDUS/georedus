import { Flex } from '@orioro/react-ui-core'

export const LINE_WIDTH_1 = 1

export const LINE_WIDTH_OPTIONS = Array.from(
  { length: 5 },
  (_, i) => i + 1,
).map((v) => ({
  label: `${v}px`,
  value: v,
}))

export function lineWidthSelector({ defaultValue = LINE_WIDTH_1 } = {}) {
  return {
    label: 'Espessura da linha',
    helperText: 'Selecione a expessura da linha para a camada',
    type: 'select',
    clearable: false,
    defaultValue: defaultValue,
    options: LINE_WIDTH_OPTIONS.map((opt) => {
      return {
        ...opt,
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: 15,
                height: 0,
                borderTop: `${opt.value}px solid black`,
              }}
            />
            <div> {opt.label}</div>
          </Flex>
        ),
      }
    }),
  }
}
