import { useQuery } from '@tanstack/react-query'
import { Debug, LoadingIndicator } from '@orioro/react-ui-core'
import { googleSheetsUrl } from './util'
import { csvFormat } from 'd3-dsv'
import { get } from '@orioro/get'
import { csvParse } from 'd3-dsv'
import { parseViewSpec } from './parseViewSpec'

export default {
  title: 'GeoReDUS / viewSpecs',
}

// https://docs.google.com/spreadsheets/d/1Y2Pt8fXzhGUA_Nhwz7vOyEZUKi6FEP71DChfYBSTa7U/edit?gid=2016686120#gid=2016686120

export const Basic = () => {
  const specsQuery = useQuery({
    queryKey: ['query'],
    queryFn: async () => {
      const csvStr = await fetch(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7R3I_EjXhXkNK5OE4qUG_uiSg9qZrPIzzVPtj0fNA4EympIWzQA4KkFt6TNwp6RYH7ZgaJrDJ4z6J/pub?gid=2016686120&single=true&output=csv',
        // googleSheetsUrl({
        //   sheetId: '1Y2Pt8fXzhGUA_Nhwz7vOyEZUKi6FEP71DChfYBSTa7U',
        //   sheetName: 'GeoReDUS',
        // }),
      ).then((res) => res.text())

      const viewSpecs = csvParse(csvStr)

      const data = viewSpecs.map((entry) => parseViewSpec(entry, viewSpecs))

      return data
    },
    throwOnError: true,
  })

  return specsQuery.status === 'pending' ? (
    <LoadingIndicator />
  ) : (
    <Debug style={{ fontSize: '.8rem' }} data={specsQuery.data} />
  )
}
