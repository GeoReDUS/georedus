type ViewConf = {
  id: string
  [key: string]: any
}

type State = {
  byId: Record<string, ViewConf>
  layout: ViewConf['id'][][]
}

type Action =
  | { type: 'SET_VIEW'; payload: { viewConf: ViewConf; layoutIndex?: number } }
  | { type: 'DEACTIVATE_VIEW'; payload: string }

export function viewConfReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': {
      const { viewConf, layoutIndex } = action.payload

      let newLayout = [...state.layout]

      // If layoutIndex is provided, move/add to the specified layout
      if (layoutIndex !== undefined) {
        newLayout = state.layout.map((layout) =>
          layout.filter((viewId) => viewId !== viewConf.id),
        )

        while (newLayout.length <= layoutIndex) {
          newLayout.push([])
        }

        newLayout[layoutIndex] = [...newLayout[layoutIndex], viewConf.id]
      }

      return {
        byId: { ...state.byId, [viewConf.id]: viewConf }, // Insert or update viewConf
        layout: newLayout,
      }
    }

    case 'DEACTIVATE_VIEW': {
      const id = action.payload
      const newById = { ...state.byId }
      delete newById[id]

      const newLayout = state.layout
        .map((layout) => layout.filter((viewId) => viewId !== id))
        .filter((layout) => layout.length > 0)

      return { byId: newById, layout: newLayout.length > 0 ? newLayout : [[]] }
    }

    default:
      return state
  }
}

export function viewConfReducerInitialState(): State {
  return {
    byId: {},
    layout: [[]],
  }
}
