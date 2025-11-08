import React, { useState } from 'react'
import { Meta } from '@storybook/react'
import { CategoricalLegend } from './CategoricalLegend'
import { ThemeProvider } from 'styled-components'
import { Flex } from '@orioro/react-ui-core'
import { cross_1, diamonds_1 } from '@orioro/react-maplibre-util'
import { Icon } from '@mdi/react'
import { mdiHospitalBox } from '@mdi/js'
import { interpolate } from '@orioro/util'

console.log('diamonds_1', diamonds_1)

const meta: Meta<typeof CategoricalLegend> = {
  title: 'CategoricalLegend',
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
    <CategoricalLegend
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
                      box: {
                        style: {
                          outline: `1px solid red`,
                        },
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
                      box: {
                        style: null,
                      },
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

// https://pattern.monster/cross-section
const SQUARES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20" width="20">
  <defs>
    <pattern patternTransform="scale(.5)" id="a" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="none" />
      <path fill="none" stroke="\${ stroke = #9D0008 }" stroke-width="2" d="M10 0v20ZM0 10h20Z" />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`

const SQUARES_45_DEG = `<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern patternTransform="rotate(45) scale(.35)" id="a" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#fff" />
      <path fill="none" stroke="#000" stroke-width="2" d="M10 0v20ZM0 10h20Z" />
    </pattern>
  </defs>
  <rect width="800%" height="800%" fill="url(#a)" />
</svg>`

function svgBgImage(svg, options = {}) {
  return `url("data:image/svg+xml,${encodeURIComponent(interpolate(svg, options))}")`
}

export const WithIcons = (props = {}) => {
  const [items, setItems] = useState([
    {
      id: '1',
      color: 'rgb(84, 39, 143)',
      label: 'Simple color',
    },
    {
      id: '4',
      color: '#bcbddc',
      label: 'Round',
      box: {
        style: {
          borderRadius: '100%',
        },
      },
    },
    {
      id: '5',
      // color: '#dadaeb',
      color: 'transparent',
      label: 'Transparent',
    },
    {
      id: '6',
      color: 'white',
      label: 'Hospital icon',
      box: {
        children: <Icon color="green" path={mdiHospitalBox} />,
        style: {
          borderColor: 'lightgray',
          borderStyle: 'solid',
          borderWidth: '1px',
        },
      },
    },
    {
      id: '6',
      label: 'Pattern +',
      box: {
        style: {
          borderColor: 'lightgray',
          borderStyle: 'solid',
          borderWidth: '1px',
          backgroundImage: svgBgImage(
            cross_1({
              fill: 'transparent',
              scale: '0.5',
            }),
          ),
        },
      },
    },
    {
      id: '7',
      // color: 'lightgray',
      label: 'Pattern Squares',
      box: {
        style: {
          borderColor: 'lightgray',
          borderStyle: 'solid',
          borderWidth: '1px',
          backgroundImage: svgBgImage(SQUARES, {
            stroke: 'green',
          }),
        },
      },
    },
    {
      id: '8',
      // color: 'lightgray',
      label: 'Pattern Diamonds',
      box: {
        style: {
          borderColor: 'lightgray',
          borderStyle: 'solid',
          borderWidth: '1px',
          backgroundImage: svgBgImage(
            diamonds_1({
              fill: 'transparent',
              scale: '0.25',
            }),
          ),
        },
      },
    },
  ])

  return (
    <CategoricalLegend
      title="Taxa de acerto"
      unit="% de acertos"
      items={items}
      {...props}
    />
  )
}
