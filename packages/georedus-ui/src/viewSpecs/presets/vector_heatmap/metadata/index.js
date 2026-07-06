import { interpolate } from '@orioro/util'
import { resolveAsync } from '@orioro/resolve'
import { COLOR_SCHEMES } from '../../../util'


export function metadata(viewSpec, allViewSpecs, context) {
  const { style } = viewSpec

  return resolveAsync.fn(async (ctx) => {
    console.log("ctx", ctx)
    const colorSchemeId = ctx.view.conf?.style?.colorScheme || style.colorScheme
    console.log('colorSchemeID', colorSchemeId)

    const steps = style.steps.map((step, index) => ({
      ...step,
      color: COLOR_SCHEMES[colorSchemeId].scalesByK[style.steps.length][index],
    }))
    return {
      steps: steps,
    }
  })
}
