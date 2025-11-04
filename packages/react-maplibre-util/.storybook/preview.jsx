import { ThemeProvider } from 'styled-components'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={{}}>
          <Story />
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
}

export default preview
