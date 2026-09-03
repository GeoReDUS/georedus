# useViews

Hook that resolves all active views through a staged async pipeline and returns them ready for rendering.

## Overview

Each view is resolved through four stage groups:

```
[metadata] → [sources] → [layers] → [controls, download]
```

Stages within a group are parallel — they share the same upstream dependencies and neither depends on the other. Stages in different groups are sequential — a group only runs once all preceding groups are resolved for that view.

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

`PIPELINE_STAGES` is a 2D array — each element is a group of parallel stages. The outer loop iterates over groups; the inner loop iterates over stages within each group, appending to the accumulator as it goes:

```ts
// Accumulator progression (group → stage → result)
group 0: [metadata]
  metadata:  {} → { metadata }

group 1: [sources]
  sources:   { metadata } → { metadata, sources }

group 2: [layers]
  layers:    { metadata, sources } → { metadata, sources, layers }

group 3: [controls, download]  — parallel
  controls:  { metadata, sources, layers } → { metadata, sources, layers, controls }
  download:  { metadata, sources, layers, controls } → { metadata, sources, layers, controls, download }
  // 'all_previous_stages' for both resolves to group indices 0–2: [metadata, sources, layers]
  // controls does NOT appear in download's dependencies even though it was added first
```

## Cache invalidation

Each stage query key is composed of:

Each stage query key has seven segments:

| Segment | Value | Invalidates |
|---|---|---|
| 0 | `'GeoReDUS:ViewStage'` | Namespace only — avoids collisions with other query keys. |
| 1 | `viewId` | Scopes cache per view. Views are fully independent. |
| 2 | `stageKey` | Scopes within a view. Each stage has its own cache entry. |
| 3 | `app` | All stages for all views, on app context change (e.g. auth, locale). |
| 4 | `viewConf` (filtered) | See conf-scoped invalidation below. |
| 5 | upstream stage versions | This stage, when an upstream stage refetches or errors. |
| 6 | `stageDependencies` | This stage only, scoped to upstream data it declared interest in. |

### Conf-scoped invalidation (segment 4)

`viewConf` is filtered through `confSchema[scope][prop].notify` before being included in the key. A prop is included in a stage's key only when its `notify` targets that stage (or is absent, meaning it targets all stages). This prevents unrelated conf changes from invalidating stages that don't care about them.

| `notify` value | Directly invalidates |
|---|---|
| absent / falsy | all stages |
| `'sources'` (string) | `sources` only |
| `['sources', 'layers']` (array) | `sources` and `layers` only |

**Cascading note:** even when `notify` scopes a conf change to a single stage (e.g. `'metadata'`), downstream stages are still invalidated indirectly. Once `metadata` re-resolves, its `dataUpdatedAt` advances and changes segment 5 for every stage that lists `metadata` in `dependsOnStages`. The `notify` filter controls which stage triggers first, not whether the cascade happens.

### Upstream stage versions (segment 5)

For each entry in `dependsOnStages`, the key encodes the upstream query's current state using React Query's own timestamps. The token changes exactly when the upstream stage transitions state or produces new data — on a successful refetch, on a new error, or when stale data is being served during a transition. This ensures the downstream stage re-resolves in lockstep with any meaningful upstream change, and is stable when nothing has changed.

### Stage dependencies (segment 6)

`viewSpec[stageKey]._dependencies({ ...viewResolutionContextBase, view: partialView })` lets a stage declare exactly which slice of upstream data it cares about. React Query re-fetches only when that extracted value changes. If `_dependencies` is not defined, segment 6 is `'STABLE_DEPENDENCY'` and the stage is immune to upstream data changes (segment 5 still applies).

### Invalidation scope summary

| Trigger | Scope |
|---|---|
| `app` change | all stages, all views |
| conf prop (`notify` absent) | all stages, one view |
| conf prop (`notify: 'sources'`) | `sources` directly; downstream cascade via seg 5 |
| upstream stage refetch | all stages that declare it in `dependsOnStages` |
| upstream data slice unchanged | no re-resolution (guarded by `_dependencies`) |

## Output

`useViews` returns:

| Field | Type | Description |
|---|---|---|
| `resolvedViews` | `Partial<ResolvedView>[]` | All active views with stage data merged in. Unresolved stages carry `STAGE_LOADING` or `STAGE_ERROR` sentinels. Use `viewsReadyAtStage` to obtain a filtered subset. |
| `viewsReadyAtStage` | `(stageKey: ViewStageKey) => Partial<ResolvedView>[]` | Returns views where all stages up to and including `stageKey` are resolved. Pass `'layers'` for the minimum renderable set (`controls` and `download` are excluded from that gate). |
| `resolvedViewSpecs` | `ViewSpec[]` | View specs with `confSchema` resolved synchronously. Schema can depend on other views' conf values; async resolution would cause visible UI flicker on conf edits. |
| `queriesByStage` | `QueriesByStage` | Raw React Query result arrays for all stages, keyed by stage name. One entry per view, in `viewsToResolve` order. |
| `currentLoadingStage` | `(viewId?: string \| null) => ViewStageKey \| null` | Called with no argument or `null`: global bottleneck — the earliest pipeline stage still loading across any view. Called with a `viewId`: per-view bottleneck for that view. Returns `null` when fully resolved. |
