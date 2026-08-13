import {
  categoricalColorSchemeSelector,
  linePatternSelector,
  lineWidthSelector,
  CUSTOM_COLOR_SCHEME,
} from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        customColor: viewSpec.style?.colorScheme === CUSTOM_COLOR_SCHEME,
      }),
      linePattern: linePatternSelector({ defaultValue: styleSpec.linePattern }),
      lineWidth: lineWidthSelector({ defaultValue: styleSpec.lineWidth }),
    },
  }
}
