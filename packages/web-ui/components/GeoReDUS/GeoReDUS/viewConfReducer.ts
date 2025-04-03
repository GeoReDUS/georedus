import { ItemList } from '@orioro/react-sortable'
import { uniqBy } from 'lodash'

type ViewConf = {
  id: string
  [key: string]: any
}

type State = {
  byId: Record<string, ViewConf>
  layout: ItemList[]
}

type Action =
  | { type: 'SET_VIEW'; payload: { viewConf: ViewConf; layoutIndex?: number } }
  | { type: 'DEACTIVATE_VIEW'; payload: string }
  | { type: 'SET_LAYOUT'; payload: ItemList[] }

const CONF_TAB_IDS = ['data', 'style']

export function viewConfReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': {
      const { viewConf } = action.payload

      let layoutIndex =
        typeof action.payload.layoutIndex === 'number'
          ? action.payload.layoutIndex
          : state.layout.findIndex((list) =>
              list.items.some((item) => item.id === viewConf.id),
            )

      layoutIndex = layoutIndex === -1 ? 0 : layoutIndex

      return {
        byId: { ...state.byId, [viewConf.id]: viewConf }, // Insert or update viewConf
        layout: state.layout.map((list, listIndex) => ({
          ...list,
          items:
            listIndex === layoutIndex
              ? uniqBy(
                  [
                    ...list.items,
                    {
                      id: viewConf.id,
                    },
                  ],
                  (item) => item.id,
                )
              : list.items.filter((item) => item.id !== viewConf.id),
        })),
      }
    }

    case 'DEACTIVATE_VIEW': {
      const viewConfId = action.payload
      const newById = { ...state.byId }
      delete newById[viewConfId]

      return {
        byId: newById,
        layout: state.layout.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== viewConfId),
        })),
      }
    }

    case 'SET_LAYOUT': {
      const newLayout = action.payload

      //
      // Naive implementation:
      //
      // TODO: handle situations in which new layout may
      // have removed some items
      //
      return {
        ...state,
        layout: newLayout,
      }
    }

    default:
      return state
  }
}

export function viewConfReducerInitialState(initialState): State {
  console.log('HELLO', initialState)

  return (
    initialState || {
      byId: {},
      layout: [
        { id: 'left', items: [] },
        { id: 'right', items: [] },
      ],
    }
  )
}

//
// Loads viewconf and loads global/shared configuration
//
// export function resolveViewConf(
//   state: State,
//   id: string,
//   viewSpecsById: Record<string, ViewSpec>,
// ): ViewConf {
//   //
//   // Load the view's self conf
//   //
//   const viewConfSelf = state.byId[id]

//   //
//   // Load global configurations from other active views
//   //
//   const globalConf = Object.entries(state.byId)
//     .map(([otherViewId, otherViewConf]) => {
//       if (otherViewId === id) {
//         return null
//       }

//       const otherViewSpec = viewSpecsById[otherViewId]

//       const otherViewGlobalConfPairs =
//         otherViewSpec.conf &&
//         CONF_TAB_IDS.flatMap((tabId) => {
//           const tabSchema = otherViewSpec.conf[tabId]

//           if (!tabSchema) {
//             return null
//           }

//           const tabValue = otherViewConf[tabId]

//           return Object.entries(tabSchema)
//             .filter(([propertyKey, propertySchema]) =>
//               Boolean(propertySchema && propertySchema.global),
//             )
//             .map(([propertyKey, propertySchema]) => {
//               const propertyValue = tabValue ? tabValue[propertyKey] : undefined

//               return typeof propertyValue === 'undefined'
//                 ? null
//                 : [propertyKey, propertyValue]
//             })
//         }).filter(Boolean)

//       return otherViewGlobalConfPairs.length > 0
//         ? {
//             viewId: otherViewId,
//             conf: Object.fromEntries(otherViewGlobalConfPairs),
//           }
//         : null
//     })
//     .filter(Boolean)

//   console.log({
//     globalConf,
//   })

//   return { ...viewConfSelf, global: globalConf }
// }
