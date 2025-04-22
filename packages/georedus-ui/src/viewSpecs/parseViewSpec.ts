import * as PRESETS from './presets'
import { unflat } from './util'

export function parseViewSpec(specInput, otherSpecInputs, context) {
  specInput = unflat(specInput)

  const preset = specInput.preset ? PRESETS[specInput.preset] : null

  if (preset) {
    return preset(specInput, otherSpecInputs, context)
  } else {
    return specInput
  }
}
