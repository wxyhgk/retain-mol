import type { Operation } from '../../../../domain/entities/Operation';
import { type EditorLineLength } from '../../../../utilities';
export declare class LineLengthChangeOperation implements Operation {
    private readonly lineLengthUpdate;
    private readonly previousLineLength;
    constructor(lineLengthUpdate: Partial<EditorLineLength>);
    execute(): void;
    invert(): void;
}
