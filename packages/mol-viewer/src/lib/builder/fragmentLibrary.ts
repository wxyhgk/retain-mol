/** Compatibility facade. New fragment internals should import model/catalog/registry directly. */
export type { FragmentAtom, FragmentBond, FragmentDef } from './fragment/model'
export { FRAGMENTS } from './fragment/catalog'
export {
  computeFragmentDigest,
  getFragment,
  getFragmentByDigest,
  getFragmentDigest,
  listFragments,
  registerFragment,
  unregisterFragment,
} from './fragment/registry'
