import type { Selection } from 'd3';
import type { Peptide } from '../../../domain/entities/Peptide';
import type { EditorTheme } from '../../../domain/types/theme';
import { BaseMonomerRenderer } from '../../render/renderers/BaseMonomerRenderer';
import type { DeepPartial } from '../../../types';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
type RendererTheme = DeepPartial<{
    ketcher: EditorTheme;
}>;
export declare class PeptideRenderer extends BaseMonomerRenderer {
    monomer: Peptide;
    CHAIN_START_TERMINAL_INDICATOR_TEXT: string;
    CHAIN_END_TERMINAL_INDICATOR_TEXT: string;
    constructor(monomer: Peptide, scale?: number);
    getHighlightPath(offset?: number): HighlightPathData;
    protected get modificationConfig(): {
        backgroundId: string;
        requiresFill: boolean;
    } | undefined;
    protected appendBody(rootElement: Selection<SVGGElement, void, HTMLElement, never>, theme: RendererTheme): Selection<SVGUseElement, this, HTMLElement, never>;
    get textColor(): string;
    show(theme: RendererTheme): void;
    get enumerationElementPosition(): {
        x: number;
        y: number;
    };
    get beginningElementPosition(): {
        x: number;
        y: number;
    };
}
export {};
