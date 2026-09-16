import { FlexModePolymerBondRenderer } from '../../../render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from '../../../render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond';
export declare enum LayoutMode {
    Flex = "Flex",
    Snake = "Snake"
}
type PolymerBondRendererClass = FlexModePolymerBondRenderer | SnakeModePolymerBondRenderer;
export declare class PolymerBondRendererFactory {
    static createInstance(polymerBond: PolymerBond | HydrogenBond): PolymerBondRendererClass;
    static createInstanceByMode(mode: LayoutMode, polymerBond: PolymerBond): PolymerBondRendererClass | never;
}
export {};
