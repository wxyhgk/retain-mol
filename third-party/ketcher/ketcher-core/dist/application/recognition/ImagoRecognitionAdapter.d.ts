import { MolSerializer } from '../../domain/serializers/mol/molSerializer';
import type { RecognizeResult } from '../../domain/services';
import type { MoleculeRecognitionAdapter, RecognizeImageInput, RecognizedMoleculeV1 } from './recognition.types';
type ImagoRecognize = (image: Blob, version: string) => Promise<RecognizeResult>;
type StructureDeserializer = Pick<MolSerializer, 'deserialize'>;
export declare class ImagoRecognitionAdapter implements MoleculeRecognitionAdapter {
    private readonly recognizeImage;
    private readonly serializer;
    readonly provider = "imago";
    constructor(recognizeImage: ImagoRecognize, serializer?: StructureDeserializer);
    recognize(input: RecognizeImageInput): Promise<RecognizedMoleculeV1>;
}
export {};
