import { Flex } from '@orioro/react-ui-core'
import { GEOREDUS_LABELED_COLORS } from '../../../../util/colorSchemes'

export const COLOR_OPTIONS = Object.values(GEOREDUS_LABELED_COLORS)

export function colorSelector(_initialColor, _customColor = false) {
  const customColorOption = _customColor
    ? {
        value: 'customColor',
        label: (
          <Flex direction="row" alignItems="center" gap="2">
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: _customColor === 'string' ? _customColor : '#ffffff',
                border: '1px solid #999',
              }}
            />
            <div>Cor personalizada</div>
          </Flex>
        ),
      }
    : null

  return {
    label: 'Cor',
    helperText: 'Selecione a cor para a camada',
    type: 'select',
    clearable: false,
    defaultValue: _initialColor,
    options: [
      ...(customColorOption ? [customColorOption] : []),
      ...COLOR_OPTIONS.map((opt) => ({
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
    ],
  }
}
