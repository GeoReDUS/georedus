import React from 'react'
import {
  CategoricalLegend,
  ThresholdColorLegend,
  SequentialColorLegend,
} from '../CategoricalLegend'
import { ProportionalSymbolLegend } from '../ProportionalSymbolLegend'
import { ContinuousColorLegend } from '../ContinuousColorLegend/ContinuousColorLegend'

const LEGENDS = {
  CategoricalLegend,
  ContinuousColorLegend,
  ThresholdColorLegend,
  SequentialColorLegend,
  ProportionalSymbolLegend,
}

export function Legend({
  type,
  ...props
}: {
  type: keyof typeof LEGENDS
  [key: string]: any
}) {
  const Component = LEGENDS[type]

  if (!Component) {
    throw new Error(`Unrecognized legend type ${type}`)
  }

  return <Component {...props} />
}
