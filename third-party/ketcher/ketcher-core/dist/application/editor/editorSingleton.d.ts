import type { CoreEditor } from './Editor';
export declare function setEditorRenderingContext(editor: CoreEditor | undefined): void;
export declare function setEditorInstance(editor: CoreEditor): void;
export declare function resetEditorInstance(ketcherId?: string): void;
export declare function provideEditorInstance(ketcherId?: string): CoreEditor;
