import {
  categoricalColorSchemeSelector,
  linePatternSelector,
  lineWidthSelector,
} from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
      }),
      linePattern: linePatternSelector({ defaultValue: styleSpec.linePattern }),
      lineWidth: lineWidthSelector({ defaultValue: styleSpec.lineWidth }),
    },
  }
}
