import React from 'react'
import { Meta } from '@storybook/react'
import { ProportionalSymbolLegend } from './ProportionalSymbolLegend'
import { ThemeProvider } from 'styled-components'
import { Flex } from '@orioro/react-ui-core'

const meta: Meta<typeof ProportionalSymbolLegend> = {
  title: 'ProportionalSymbolLegend',
  decorators: [
    (Story) => (
      <div
        style={{
          fontFamily: 'sans-serif',
        }}
      >
        <ThemeProvider theme={{}}>
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],
}

export default meta

export const Basic = () => {
  return (
    <Flex direction="row">
      <ProportionalSymbolLegend
        title="Quantidade de habitantes"
        unit="Moradores totais"
        max={120}
        min={30}
        labelUnit="hab"
        labelWidth={40}
      />
    </Flex>
  )
}
