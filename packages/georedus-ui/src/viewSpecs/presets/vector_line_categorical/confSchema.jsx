import {
  categoricalColorSchemeSelector,
  linePatternSelector,
  lineWidthSelector,
  CUSTOM_COLOR_SCHEME,
} from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style
  const categories = styleSpec?.categories

  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: styleSpec?.colorScheme,
        customColor:
          styleSpec?.colorScheme === CUSTOM_COLOR_SCHEME
            ? categories && Array.isArray(categories)
              ? categories.map((cat) => cat.color)
              : true
            : false,
      }),
      linePattern: linePatternSelector({ defaultValue: styleSpec.linePattern }),
      lineWidth: lineWidthSelector({ defaultValue: styleSpec.lineWidth }),
    },
  }
}
