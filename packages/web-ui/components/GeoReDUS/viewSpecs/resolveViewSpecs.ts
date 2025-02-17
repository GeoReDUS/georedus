import { csvParse } from 'd3-dsv'
import { ViewSpec } from './types'
import { parseViewSpec } from './parseViewSpec'
import { uniqBy } from 'lodash'

const URL_RE = /^https?:\/\//

function _fromArr(viewSpecsInput: any[]): ViewSpec[] {
  return uniqBy(
    viewSpecsInput
      .map((entry) => parseViewSpec(entry, viewSpecsInput))
      .filter(Boolean),
    (viewSpec) => viewSpec.id,
  )
}

function _fromCsvStr(csvStr: string): ViewSpec[] {
  return _fromArr(csvParse(csvStr))
}

export async function resolveViewSpecs(viewSpecsInput: string | ViewSpec[]) {
  if (typeof viewSpecsInput === 'string') {
    if (URL_RE.test(viewSpecsInput)) {
      return _fromCsvStr(await fetch(viewSpecsInput).then((res) => res.text()))
    } else {
      return _fromCsvStr(viewSpecsInput)
    }
  } else if (Array.isArray(viewSpecsInput)) {
    return _fromArr(viewSpecsInput)
  } else {
    throw new TypeError(`Invalid viewSpecsInput: ${viewSpecsInput}`)
  }
}
