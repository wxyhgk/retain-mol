export interface CoordinationGeometrySelection {
  readonly classId: string
  readonly fragmentId: string
}

export type CoordinationSitePickerState =
  | { readonly status: 'catalog' }
  | (CoordinationGeometrySelection & {
    readonly status: 'inspecting'
    readonly hoveredSiteId: string | null
    readonly error?: string
  })
  | (CoordinationGeometrySelection & {
    readonly status: 'compiling'
    readonly siteId: string
  })
  | (CoordinationGeometrySelection & {
    readonly status: 'armed'
    readonly siteId: string
  })
  | { readonly status: 'cancelled' }

export type CoordinationSitePickerEvent =
  | ({ readonly type: 'SELECT_GEOMETRY' } & CoordinationGeometrySelection)
  | { readonly type: 'HOVER_SITE'; readonly siteId: string | null }
  | { readonly type: 'SELECT_SITE'; readonly siteId: string }
  | { readonly type: 'SUCCESS' }
  | { readonly type: 'FAILURE'; readonly error?: string }
  | { readonly type: 'BACK' }
  | { readonly type: 'CANCEL' }

export const initialCoordinationSitePickerState: CoordinationSitePickerState = {
  status: 'catalog',
}

export function coordinationSitePickerReducer(
  state: CoordinationSitePickerState,
  event: CoordinationSitePickerEvent,
): CoordinationSitePickerState {
  if (event.type === 'CANCEL') {
    if (state.status === 'armed' || state.status === 'cancelled') return state
    return { status: 'cancelled' }
  }

  switch (state.status) {
    case 'catalog':
      if (event.type !== 'SELECT_GEOMETRY') return state
      return {
        status: 'inspecting',
        classId: event.classId,
        fragmentId: event.fragmentId,
        hoveredSiteId: null,
      }

    case 'inspecting':
      switch (event.type) {
        case 'SELECT_GEOMETRY':
          return {
            status: 'inspecting',
            classId: event.classId,
            fragmentId: event.fragmentId,
            hoveredSiteId: null,
          }
        case 'HOVER_SITE':
          return { ...state, hoveredSiteId: event.siteId }
        case 'SELECT_SITE':
          return {
            status: 'compiling',
            classId: state.classId,
            fragmentId: state.fragmentId,
            siteId: event.siteId,
          }
        case 'BACK':
          return initialCoordinationSitePickerState
        default:
          return state
      }

    case 'compiling':
      if (event.type === 'SUCCESS') return { ...state, status: 'armed' }
      if (event.type === 'FAILURE') {
        return {
          status: 'inspecting',
          classId: state.classId,
          fragmentId: state.fragmentId,
          hoveredSiteId: state.siteId,
          ...(event.error === undefined ? {} : { error: event.error }),
        }
      }
      return state

    case 'armed':
    case 'cancelled':
      return state
  }
}
