# useViews

Hook that resolves all active views through a staged async pipeline and returns them ready for rendering.

## Overview

Each view is resolved in five sequential stages:

```
metadata → sources → layers → controls
                            ↘ download
```

Each stage depends on the output of the previous ones. A stage query is only enabled once its dependencies are resolved for that specific view.

## Why `useQueries` instead of a single `useQuery`

The renderer consumes all views together, so resolution is orchestrated in a single hook. However, using one aggregate `useQuery` would mean any change to any view re-fetches everything.

Instead, each view × stage combination gets its own query via `useQueries`. This lets React Query update a single view's stage independently while leaving all other views intact.

```
View A: [metadata ✓] [sources ✓] [layers ✓]  ← stable, not re-fetched
View B: [metadata ✓] [sources ↻] [layers …]  ← only B's sources re-fetching
```

Array order across all `useQueries` calls is kept stable (derived from `viewsToResolve`) so each view's index maps consistently to its query result in every stage.

## Stage accumulator pattern

Before each stage is invoked, a snapshot of all preceding resolved queries is assembled into `partialViews`. Each partial view carries the data resolved so far, or a sentinel symbol (`STAGE_LOADING` / `STAGE_ERROR`) for stages that are not yet complete.

Downstream stages use these partial views to:
- determine whether their own query should be enabled (all required prior stages resolved)
- compute dynamic cache keys via `_dependencies`, which can read from prior stage data

```ts
// Conceptual accumulator progression
QUERIES_AT_METADATA  = {}
QUERIES_AT_SOURCES   = { metadata }
QUERIES_AT_LAYERS    = { metadata, sources }
QUERIES_AT_CONTROLS  = { metadata, sources, layers }
```

## Cache invalidation

Each stage query key is composed of:

| Element | Invalidates |
|---|---|
| `'ViewStage'` | —  namespace only, avoids collisions with other query keys |
| `viewId` | Scopes cache per view. Views are fully independent. |
| `stageKey` | Scopes within a view. Each stage has its own cache entry. |
| `viewConf` | All stages for this view, on any conf change. |
| `app` | All stages for all views, on app context change (e.g. auth, locale). |
| `stageDependencies` | This stage only, based on what it declared via `_dependencies`. |

`stageDependencies` is the return value of `viewSpec[stageKey]._dependencies({ view: partialView })`. The stage extracts only the upstream data it cares about; React Query re-fetches only when that extracted value changes. If `_dependencies` is not defined, the value is `'STABLE_DEPENDENCY'` and the stage is immune to upstream stage changes.

Invalidation scope summary: `app` → all views, all stages. `viewConf` → all stages for one view. `stageDependencies` → one stage for one view, scoped to declared upstream data.

## Output

`useViews` returns:

| Field | Description |
|---|---|
| `resolvedViews` | Views where `metadata`, `sources`, and `layers` are all resolved. Passed to the renderer. |
| `resolvedViewSpecs` | View specs with `confSchema` resolved synchronously (schema can depend on other views' conf values). |
| `isLoading` | True while any metadata/sources/layers/controls query is pending. |
| `metadataQueries` | Raw React Query results for the metadata stage, one entry per view. |
| `sourcesQueries` | Raw React Query results for the sources stage. |
| `layersQueries` | Raw React Query results for the layers stage. |
| `controlsQueries` | Raw React Query results for the controls stage. |
| `downloadQueries` | Raw React Query results for the download stage. |

Note: `download` is excluded from the `resolvedViews` filter — a view is considered renderable before its download capability is resolved.
