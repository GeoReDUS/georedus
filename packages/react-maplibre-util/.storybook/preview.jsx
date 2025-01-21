import { ThemeProvider } from 'styled-components'

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={{}}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
