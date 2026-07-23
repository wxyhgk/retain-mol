export type InteractionMode = 'read-only' | 'select' | 'edit'

export function resolveInteractionMode(
  interactionMode: InteractionMode | undefined,
  readOnly: boolean | undefined,
): InteractionMode {
  if (interactionMode !== undefined) return interactionMode
  return readOnly === true ? 'read-only' : 'edit'
}

export function canEditInInteractionMode(interactionMode: InteractionMode): boolean {
  return interactionMode === 'edit'
}

export function canSelectInInteractionMode(interactionMode: InteractionMode): boolean {
  return interactionMode !== 'read-only'
}

export function shouldEnableCameraControls(
  interactionMode: InteractionMode,
  toolTransformsObject: boolean,
): boolean {
  return interactionMode !== 'edit' || !toolTransformsObject
}
