import { continuousColorSchemeSelector } from '../util/components/confInputs'
import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'

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
    },
  }
}
