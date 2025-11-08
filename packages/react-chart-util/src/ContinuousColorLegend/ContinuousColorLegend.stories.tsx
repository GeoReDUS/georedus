import React from 'react'
import { ContinuousColorLegend } from './ContinuousColorLegend'
import { interpolateInferno, interpolateSpectral } from 'd3-scale-chromatic'

export default {
  title: 'ContinuousColorLegend',
}

export const ContinuousColorLegendBasic = () => {
  return (
    <ContinuousColorLegend
      colors={interpolateInferno}
      domain={[18, 70]}
      unit="°"
    />
  )
}

export const ContinuousColorLegendColors = () => {
  return (
    <ContinuousColorLegend
      title="Temperatura máxima de superfície"
      colors={(t) => interpolateSpectral(1 - t)}
      domain={[18, 60]}
      unit="°"
    />
  )
}
