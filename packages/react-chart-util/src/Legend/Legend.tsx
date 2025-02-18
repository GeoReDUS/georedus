import React from 'react'
import {
  ColorLegend,
  ThresholdColorLegend,
  SequentialColorLegend,
} from '../ColorLegend'
import { ProportionalSymbolLegend } from '../ProportionalSymbolLegend'

const LEGENDS = {
  ColorLegend,
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
