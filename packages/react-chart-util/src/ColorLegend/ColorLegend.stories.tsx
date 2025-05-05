import React, { useState } from 'react'
import { Meta } from '@storybook/react'
import { ColorLegend } from './ColorLegend'
import { ThemeProvider } from 'styled-components'
import { Flex } from '@orioro/react-ui-core'

const meta: Meta<typeof ColorLegend> = {
  title: 'ColorLegend',
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

export const Basic = (props = {}) => {
  const [items, setItems] = useState([
    {
      id: '1',
      color: 'rgb(84, 39, 143)',
      label: 'More than 0.08',
    },
    {
      id: '2',
      color: 'rgb(117, 107, 177)',
      label: '0.06 to 0.08',
    },
    {
      id: '3',
      color: 'rgb(158, 154, 200)',
      label: '0.04 to 0.06',
    },
    {
      id: '4',
      color: '#bcbddc',
      label: '0.02 to 0.04',
    },
    {
      id: '5',
      color: '#dadaeb',
      label: '0.01 to 0.02',
    },
    {
      id: '6',
      color: '#f2f0f7',
      label: 'Less than 0.01',
    },
  ])

  return (
    <ColorLegend
      title="Taxa de acerto"
      unit="% de acertos"
      items={items.map((item, index) => {
        return {
          ...item,
          onMouseEnter: () => {
            setItems((curr) =>
              curr.map((currItem, currIndex) =>
                currIndex === index
                  ? {
                      ...currItem,
                      boxStyle: {
                        outline: `1px solid red`,
                      },
                      labelStyle: {
                        textDecoration: 'underline',
                      },
                    }
                  : currItem,
              ),
            )
          },
          onMouseLeave: () => {
            setItems((curr) =>
              curr.map((currItem, currIndex) =>
                currIndex === index
                  ? {
                      ...currItem,
                      boxStyle: null,
                      labelStyle: null,
                    }
                  : currItem,
              ),
            )
          },
        }
      })}
      {...props}
    />
  )
}

export const Size = () => {
  return (
    <Flex gap="10px">
      <Basic size="1" />
      <Basic size="2" />
    </Flex>
  )
}
