import {
  continuousColorSchemeSelector,
  opacitySlider,
} from '../util/components/confInputs'
import { DEFAULT_HEATMAP_COLOR_SCHEME_ID } from './parseStyleSpec'

export function confSchema(viewSpec, allViewSpecs, context) {
  return {
    style: {
      colorScheme: continuousColorSchemeSelector({
        defaultValue:
          viewSpec.style?.colorScheme || DEFAULT_HEATMAP_COLOR_SCHEME_ID,
      }),
      opacity: viewSpec.style.circle
        ? null
        : opacitySlider({ defaultValue: 1 }),
    },
    local: {
      opacity: viewSpec.style.circle
        ? null
        : opacitySlider({ defaultValue: 1 }),
    },
  }
}
