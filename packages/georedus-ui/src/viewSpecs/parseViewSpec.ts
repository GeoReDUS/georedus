import * as PRESETS from './presets'
import { unflat } from './util'

console.warn('TODO: deprecate viewSpec.conf in favor of viewSpec.confSchema')

export function parseViewSpec(specInput, otherSpecInputs, context) {
  specInput = unflat(specInput)

  const preset = specInput.preset ? PRESETS[specInput.preset] : null

  const afterPreset = preset
    ? preset(specInput, otherSpecInputs, context)
    : specInput

  if (afterPreset?.conf) {
    // console.warn(`viewSpec: ${afterPreset.id} using .conf, move to .confSchema`)

    afterPreset.confSchema = afterPreset.confSchema || afterPreset.conf
  }

  return afterPreset

  // if (preset) {
  //   return
  // } else {
  //   return specInput
  // }
}
