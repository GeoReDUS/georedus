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

export function viewConfReducerInitialState(): State {
  return {
    byId: {},
    layout: [
      { id: 'left', items: [] },
      { id: 'right', items: [] },
    ],
  }
}
