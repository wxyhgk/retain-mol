import type { SerializedEditorState } from './retext';
export interface DraftInlineStyleRange {
    offset: number;
    length: number;
    style: string;
}
export interface DraftBlock {
    text: string;
    type: string;
    inlineStyleRanges?: DraftInlineStyleRange[];
    entityRanges?: Array<{
        offset: number;
        length: number;
        key: number;
    }>;
    data?: Record<string, unknown>;
}
export interface DraftEditorState {
    blocks?: DraftBlock[];
    entityMap?: Record<string, unknown>;
}
export declare function convertDraftToLexical(draftState: DraftEditorState): SerializedEditorState;
