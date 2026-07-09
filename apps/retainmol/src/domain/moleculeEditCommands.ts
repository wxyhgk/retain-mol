import { connectSelectedAtomsFromStores } from './appEditEffects'

export function connectSelectedAtoms(): boolean {
  return connectSelectedAtomsFromStores()
}
