import * as PRESETS from './presets'
import { unflat } from './util'

export function parseViewSpec(specInput, otherSpecInputs) {
  specInput = unflat(specInput)

  const preset = specInput.preset ? PRESETS[specInput.preset] : null

  if (preset) {
    return preset(specInput, otherSpecInputs)
  } else {
    return specInput
  }
}
