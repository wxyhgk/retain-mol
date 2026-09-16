import type { Atom } from '../entities/atom';
import type { Pool } from '../entities/pool';
import { Vec2 } from '../entities/vec2';
export declare function geometricCenter(positions: Vec2[]): Vec2;
export declare function getAtomPositions(atomIds: number[], atoms: Pool<Atom>): Vec2[];
