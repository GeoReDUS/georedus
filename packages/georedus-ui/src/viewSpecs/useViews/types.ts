import { UseQueryResult } from '@tanstack/react-query'
import { ViewConf } from '../../GeoReDUS/viewConfReducer'
import { ViewSpec } from '../types'

export type ViewToResolve = {
  viewId: string
  viewConf: ViewConf
  viewSpec: ViewSpec
}

//
// Object containing queries
//
export type QueriesByStage = {
  metadata: UseQueryResult[]
  sources: UseQueryResult[]
  layers: UseQueryResult[]
  controls: UseQueryResult[]
  download: UseQueryResult[]
}
