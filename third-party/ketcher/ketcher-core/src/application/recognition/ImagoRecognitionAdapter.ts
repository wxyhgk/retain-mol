import { MolSerializer } from 'domain/serializers/mol/molSerializer';
import type { RecognizeResult } from 'domain/services';
import type {
  MoleculeRecognitionAdapter,
  RecognizeImageInput,
  RecognizedMoleculeV1,
} from './recognition.types';
import { createRecognizedMolecule } from './recognizedMolecule';

type ImagoRecognize = (
  image: Blob,
  version: string,
) => Promise<RecognizeResult>;
type StructureDeserializer = Pick<MolSerializer, 'deserialize'>;

export class ImagoRecognitionAdapter implements MoleculeRecognitionAdapter {
  readonly provider = 'imago';

  constructor(
    private readonly recognizeImage: ImagoRecognize,
    private readonly serializer: StructureDeserializer = new MolSerializer(),
  ) {}

  async recognize(input: RecognizeImageInput): Promise<RecognizedMoleculeV1> {
    const response = await this.recognizeImage(
      input.image,
      input.version ?? '',
    );
    const structure = this.serializer.deserialize(response.struct);
    return createRecognizedMolecule(this.provider, structure);
  }
}
