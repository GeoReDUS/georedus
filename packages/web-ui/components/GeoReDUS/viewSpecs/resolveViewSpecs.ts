import { csvParse } from 'd3-dsv'
import { ViewSpec } from './types'
import { parseViewSpec } from './parseViewSpec'
import { groupBy, isPlainObject, uniqBy } from 'lodash'
import { fileReadAs } from '@orioro/react-ui-core'
import { strAutoCast } from '@orioro/util'

type ViewSource = string | File

//
// Autocasts values
//
function parseFromCsv(csvStr: string): ViewSource[] {
  return csvParse(csvStr).map(
    (entry) =>
      Object.fromEntries(
        Object.entries(entry).map(([key, value]) => [
          key,
          typeof value === 'string'
            ? value === ''
              ? undefined
              : strAutoCast(value)
            : value,
        ]),
      ) as unknown as ViewSource,
  )
}

export async function fetchViewSpecs(
  source: ViewSource | ViewSource[] | ViewSpecInput,
) {
  if (typeof source === 'string') {
    return parseFromCsv(await fetch(source).then((res) => res.text()))
  } else if (source instanceof File) {
    return parseFromCsv((await fileReadAs(source, 'text')) as string)
  } else if (Array.isArray(source)) {
    const first = source[0]

    if (isPlainObject(first)) {
      //
      // Assume the input is a resolved viewSpecInput array
      //
      return source
    } else {
      const data = await Promise.all(source.map((src) => fetchViewSpecs(src)))

      return data.flat(1)
    }
  } else {
    throw new Error(`Invalid source: ${source}`)
  }
}

type ViewSpecInput = ViewSpec & {
  collection_id?: string
  indicator_id?: string
  skip?: boolean
}

const NO_COLLECTION = 'no_collection'

export function resolveViewSpecs(viewSpecsInput: ViewSpecInput[]) {
  //
  // Filter out specs that do not specify
  // - collection_id or indicator_id
  // - as well as those marked as skip
  //
  viewSpecsInput = viewSpecsInput.filter(
    (specInput) =>
      specInput.collection_id &&
      specInput.collection_id.trim() &&
      specInput.indicator_id &&
      specInput.indicator_id.trim() &&
      !specInput.skip,
  )

  //
  // Group viewSpecsInput by collection_id
  //
  const byCollectionId = groupBy(
    viewSpecsInput,
    (viewSpec) => viewSpec.collection_id || NO_COLLECTION,
  )

  const parsedSpecs = Object.entries(byCollectionId).flatMap(
    ([collection_id, viewSpecsInput]) => {
      if (collection_id === NO_COLLECTION) {
        console.warn(
          `received a list of viewSpecs without collection_id`,
          viewSpecsInput,
        )

        return []
      }

      return (
        viewSpecsInput
          .map((entry) => parseViewSpec(entry, viewSpecsInput))
          // parseViewSpec may return an array of view specs
          .flat(1)
          // or no view spec
          .filter(Boolean)
      )
    },
  )

  return uniqBy(parsedSpecs, (viewSpec) => viewSpec.id)
}
