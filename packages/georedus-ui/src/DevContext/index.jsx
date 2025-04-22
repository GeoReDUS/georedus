import { Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { theme } from '@orioro/react-ui-core'
import { ThemeProvider } from 'styled-components'

export function DevContext({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme()}>
        <Theme
          accentColor="purple"
          grayColor="gray"
          radius="full"
          panelBackground="solid"
          appearance="light"
          scaling="110%"
        >
          {children}
        </Theme>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
