import React from 'react'
import {
  ThresholdColorLegend,
  SequentialColorLegend,
} from './ThresholdColorLegend'

export default {
  title: 'ThresholdColorLegend',
}

export const SequentialColorLegendBasic = () => {
  return (
    <SequentialColorLegend
      title="Taxa de acerto"
      unit="% de acertos"
      format={{
        number: ['pt-BR', { style: 'percent' }],
      }}
      steps={[
        '#f2f0f7',
        0.01,
        '#dadaeb',
        0.02,
        '#bcbddc',
        0.04,
        'rgb(158, 154, 200)',
        0.06,
        'rgb(117, 107, 177)',
        0.08,
        'rgb(84, 39, 143)',
      ]}
    />
  )
}

export const ThresholdColorLegendBasic = () => {
  return (
    <ThresholdColorLegend
      title="Taxa de acerto"
      unit="% de acertos"
      format={{
        number: ['pt-BR', { style: 'percent' }],
      }}
      steps={[
        '#f2f0f7',
        0.01,
        '#dadaeb',
        0.02,
        '#bcbddc',
        0.04,
        'rgb(158, 154, 200)',
        0.06,
        'rgb(117, 107, 177)',
        0.08,
        'rgb(84, 39, 143)',
      ]}
    />
  )
}
