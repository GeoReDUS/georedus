import { useQuery } from '@tanstack/react-query'

export function useMapStyle(
  input: string | object,
  modifier?: (styleBase: Record<string, any>) => Record<string, any>,
) {
  const styleQuery = useQuery({
    queryKey: ['MapStyle', input],
    queryFn: async () => {
      if (typeof input === 'object') return input
      const res = await fetch(input)
      if (!res.ok) throw new Error(`Failed to fetch style: ${res.status}`)
      const baseStyle = await res.json()

      return typeof modifier === 'function' ? modifier(baseStyle) : baseStyle
    },
    staleTime: Infinity,
    enabled: !!input,
  })

  return styleQuery.data || null
}
