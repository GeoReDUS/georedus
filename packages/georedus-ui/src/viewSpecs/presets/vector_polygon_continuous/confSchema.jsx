import { DEFAULT_COLOR_SCHEME_ID } from './parseStyleSpec'
import { schemeSelector } from '../util/components/confInputs'

export function confSchema(viewSpec, allViewSpecs, context) {
  const isCustomClassification =
    viewSpec.style?.classificationMethod?.type === 'custom'

  return {
    style: {
      classificationMethodType: isCustomClassification
        ? null
        : {
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
      colorScheme: isCustomClassification
        ? null
        : schemeSelector({
            defaultValue:
              viewSpec.style?.colorScheme || DEFAULT_COLOR_SCHEME_ID,
            schemeType: 'continuous',
          }),
    },
  }
}
