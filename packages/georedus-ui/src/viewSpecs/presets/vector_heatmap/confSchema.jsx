import { schemeSelector } from '../util/components/confInputs'
import { DEFAULT_HEATMAP_COLOR_SCHEME_ID } from './parseStyleSpec'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: schemeSelector({
        defaultValue: viewSpec.style?.colorScheme || DEFAULT_HEATMAP_COLOR_SCHEME_ID,
        schemeType: 'continuous',
      }),
    },
  }
}
