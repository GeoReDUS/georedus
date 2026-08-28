import { resolve } from '@orioro/resolve'
import { continuousColorSchemeSelector } from '../util/components/confInputs'
import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'

function _formatHour(fraction) {
  const h = Math.round(fraction)
  return `${String(h).padStart(2, '0')}:00`
}

export function confSchema(viewSpec, allViewSpecs, context) {
  const radiusStyle = viewSpec.style?.radius
  if (!radiusStyle?.valueKey) return { style: {} }

  return {
    style: {
      classificationMethodType: {
        label: 'Método de classificação',
        type: 'select',
        clearable: false,
        defaultValue:
          viewSpec.style?.classificationMethod?.type || 'naturalBreaks',
        options: [
          {
            value: 'naturalBreaks',
            label: 'Quebras naturais',
          },
          {
            value: 'quantile',
            label: 'Quantis',
          },
          {
            value: 'equalIntervals',
            label: 'Intervalos Iguais',
          },
        ],
      },
      colorScheme: continuousColorSchemeSelector({
        clearable: false,
        defaultValue: radiusStyle.colorScheme || DEFAULT_COLOR_SCHEME_ID,
      }),
      periodHourSlider: {
        type: 'range',
        size: '24',
        min: 0,
        max: 24,
        step: 1,
        defaultValue: [0, 24],
        label: resolve.literal(
          resolve.fn((context) => {
            const [from, to] = context.value?.periodHourSlider || [0, 24]
            return `Período de tempo (${_formatHour(from)} - ${_formatHour(to)})`
          }),
        ),
      },
    },
  }
}
