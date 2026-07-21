import { schemeSelector } from '../util/components/confInputs'
import { DEFAULT_HEATMAP_COLOR_SCHEME_ID } from './parseStyleSpec'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: schemeSelector({
        defaultValue:
          viewSpec.style?.colorScheme || DEFAULT_HEATMAP_COLOR_SCHEME_ID,
        schemeType: 'continuous',
      }),
      opacity: viewSpec.style.circle
        ? null
        : {
            type: 'slider',
            label: 'Opacidade da camada',
            size: '1',
            min: 0,
            max: 1,
            step: 0.01,
            defaultValue: 1,
          },
    },
  }
}
