// byK / diverging
import {
  schemeBrBG,
  schemePRGn,
  schemePiYG,
  schemePuOr,
  schemeRdBu,
  schemeRdGy,
  schemeRdYlBu,
  schemeRdYlGn,
  schemeSpectral,
} from 'd3-scale-chromatic'

// byK / sequential
import {
  schemeBlues,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePurples,
  schemeReds,
  schemeBuGn,
  schemeBuPu,
  schemeGnBu,
  schemeOrRd,
  schemePuBuGn,
  schemePuBu,
  schemePuRd,
  schemeRdPu,
  schemeYlGnBu,
  schemeYlGn,
  schemeYlOrBr,
  schemeYlOrRd,
} from 'd3-scale-chromatic'

// Categorical
import {
  schemeCategory10,
  schemeAccent,
  schemeDark2,
  schemeObservable10,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from 'd3-scale-chromatic'

import { get } from '@orioro/get'

export const DEFAULT_NULL_COLOR = '#CCCCCC'

export type CategoricalScheme = {
  colors: string[]
  defaultColor: string
}

export type ByKScheme = {
  scalesByK: (string[] | null)[]
  defaultColor: string
  minK: number
  maxK: number
}

function _reverseByKScheme(scheme, defaultColor = DEFAULT_NULL_COLOR) {
  const scalesByK = Array.from(scheme, (d) =>
    Array.isArray(d) ? [...d].reverse() : null,
  ) as ByKScheme['scalesByK']

  const minK = scalesByK.findIndex((v) => v !== null)

  return {
    scalesByK,
    defaultColor,
    minK,
    maxK: scalesByK.length - 1,
  }
}

function _byKScheme(scheme, defaultColor = DEFAULT_NULL_COLOR): ByKScheme {
  //
  // d3 schemes use sparse arrays (new Array(3)) to
  // keep initial schemes empty:
  //
  // https://github.com/d3/d3-scale-chromatic/blob/main/src/diverging/RdYlBu.js
  //
  // This causes some issues for us, thus we convert
  // those sparse arrays into same structure but filled ones
  //
  const scalesByK = Array.from(
    scheme,
    (d) => d || null,
  ) as ByKScheme['scalesByK']

  const minK = scalesByK.findIndex((v) => v !== null)

  return {
    scalesByK,
    defaultColor,
    minK,
    maxK: scalesByK.length - 1,
  }
}

function _categoricalScheme(
  scheme,
  defaultColor = DEFAULT_NULL_COLOR,
): CategoricalScheme {
  return { colors: scheme, defaultColor }
}

function _objMap(
  obj: Record<string, any>,
  iter: (entry: [key: string, value: any]) => [string, any],
) {
  return Object.fromEntries(Object.entries(obj).map(iter))
}

const D3_CATEGORICAL = {
  schemeCategory10,
  schemeAccent,
  schemeDark2,
  schemeObservable10,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
}

const D3_DIVERGING = {
  schemeBrBG,
  schemePRGn,
  schemePiYG,
  schemePuOr,
  schemeRdBu,
  schemeRdGy,
  schemeRdYlBu,
  schemeRdYlGn,
  schemeSpectral,
}

const D3_SEQUENTIAL = {
  schemeBlues,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePurples,
  schemeReds,
  schemeBuGn,
  schemeBuPu,
  schemeGnBu,
  schemeOrRd,
  schemePuBuGn,
  schemePuBu,
  schemePuRd,
  schemeRdPu,
  schemeYlGnBu,
  schemeYlGn,
  schemeYlOrBr,
  schemeYlOrRd,
}

export const COLOR_SCHEMES = {
  ..._objMap(D3_CATEGORICAL, ([id, scheme]) => [
    id,
    _categoricalScheme(scheme),
  ]),
  ..._objMap(D3_DIVERGING, ([id, scheme]) => [id, _byKScheme(scheme)]),
  ..._objMap(D3_DIVERGING, ([id, scheme]) => [
    `-${id}`,
    _reverseByKScheme(scheme),
  ]),
  ..._objMap(D3_SEQUENTIAL, ([id, scheme]) => [id, _byKScheme(scheme)]),
  ..._objMap(D3_SEQUENTIAL, ([id, scheme]) => [
    `-${id}`,
    _reverseByKScheme(scheme),
  ]),
}

export function colorScheme(path: string) {
  const scheme = get(COLOR_SCHEMES, path)

  if (!scheme) {
    throw new Error(`Could not find scheme at ${path}`)
  }

  return scheme
}

export function resolveColor(colorInput: string): string {
  return get(COLOR_SCHEMES, colorInput) || colorInput
}

// usar função para monstar o markdown
// Object.entries(D3_CATEGORICAL).map(([id, colors]) => {
//   console.log(id, colors)
// })
