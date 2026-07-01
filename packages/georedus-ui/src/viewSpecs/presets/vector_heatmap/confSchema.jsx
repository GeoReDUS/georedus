import { schemeSelector } from '../util/components/confInputs'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: schemeSelector({
        defaultValue: viewSpec.style?.colorScheme || 'schemeOrRd',
        schemeType: 'continuous',
      }),
    },
  }
}
