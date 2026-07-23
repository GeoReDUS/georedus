import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'
import { continuousColorSchemeSelector } from '../util/components/confInputs'
import { DEFAULT_FILL_OPACITY } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
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
        ],
      },
      colorScheme: continuousColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme || DEFAULT_COLOR_SCHEME_ID,
      }),
      opacity: {
        type: 'slider',
        label: 'Opacidade da camada',
        size: '1',
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: DEFAULT_FILL_OPACITY,
      },
    },
  }
}
