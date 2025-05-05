import * as PRESETS from './presets'
import { unflat } from './util'

export function parseViewSpec(specInput, otherSpecInputs, context) {
  specInput = unflat(specInput)

  const preset = specInput.preset ? PRESETS[specInput.preset] : null

  return preset ? preset(specInput, otherSpecInputs, context) : specInput
}
