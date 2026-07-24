import { categoricalColorSchemeSelector } from '../util'

export function confSchema(viewSpec, allViewSpecs, context) {
  const styleSpec = viewSpec.style

  return {
    style: {
      colorScheme: categoricalColorSchemeSelector({
        defaultValue: viewSpec.style?.colorScheme,
        clearable: viewSpec.style.colorScheme === null,
      }),
    },
  }
}
