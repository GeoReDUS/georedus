import './radix-ui-themes-styles.css'
import { ThemeProvider } from 'styled-components'
import { Theme } from '@radix-ui/themes'

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <Theme>
        <ThemeProvider theme={{}}>
          <Story />
        </ThemeProvider>
      </Theme>
    ),
  ],
}

export default preview
