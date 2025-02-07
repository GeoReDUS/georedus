import React from 'react'
import { ColorLegend } from './ColorLegend'
import {
  ThresholdColorLegend,
  SequentialColorLegend,
} from './ThresholdColorLegend'

const LEGENDS = {
  ColorLegend,
  ThresholdColorLegend,
  SequentialColorLegend,
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
