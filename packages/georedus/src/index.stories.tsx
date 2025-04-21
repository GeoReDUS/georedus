import React from 'react'
import { Meta } from '@storybook/react'
import { Component } from './index'
import { ThemeProvider } from 'styled-components'

const meta: Meta<typeof Component> = {
  title: 'Component',
  decorators: [
    (Story) => (
      <ThemeProvider theme={{}}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta

export const Basic = () => {
  return <Component bg="red">Component</Component>
}
