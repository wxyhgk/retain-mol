import type { Struct } from '../../domain/entities/struct';
import type { MoleculeRecognitionAdapter, RecognizeImageInput, RecognizedMoleculeV1 } from './recognition.types';
type FetchLike = typeof globalThis.fetch;
type SmilesParser = (smiles: string) => Promise<Struct>;
export type OpenAICompatibleRecognitionConfig = {
    baseUrl: string;
    apiKey?: string;
    model: string;
    parseSmiles: SmilesParser;
    fetch?: FetchLike;
};
type AiRecognitionPayload = {
    smiles: string;
    confidence?: number;
};
export declare function parseAiRecognitionPayload(content: string): AiRecognitionPayload;
export declare class OpenAICompatibleRecognitionAdapter implements MoleculeRecognitionAdapter {
    readonly provider = "openai-compatible-vision";
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly model;
    private readonly parseSmiles;
    private readonly fetch;
    constructor(config: OpenAICompatibleRecognitionConfig);
    recognize(input: RecognizeImageInput): Promise<RecognizedMoleculeV1>;
}
export {};
