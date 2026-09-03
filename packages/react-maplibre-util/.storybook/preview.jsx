import 'maplibre-gl/dist/maplibre-gl.css'
import { createGlobalStyle, ThemeProvider } from 'styled-components'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

const GlobalStyle = createGlobalStyle`
  font-family: sans-serif;
`

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={{}}>
            <Story />
          </ThemeProvider>
        </QueryClientProvider>
      </>
    ),
  ],
}

export default preview
