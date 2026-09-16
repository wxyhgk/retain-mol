import type { Struct } from 'domain/entities/struct';
import type {
  MoleculeRecognitionAdapter,
  RecognizeImageInput,
  RecognizedMoleculeV1,
} from './recognition.types';
import { createRecognizedMolecule } from './recognizedMolecule';

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

function trimCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
}

export function parseAiRecognitionPayload(
  content: string,
): AiRecognitionPayload {
  const normalized = trimCodeFence(content);
  const objectStart = normalized.indexOf('{');
  const objectEnd = normalized.lastIndexOf('}');
  if (objectStart < 0 || objectEnd <= objectStart) {
    throw new Error('AI recognition response does not contain a JSON object');
  }

  const value = JSON.parse(normalized.slice(objectStart, objectEnd + 1)) as {
    smiles?: unknown;
    confidence?: unknown;
  };
  if (typeof value.smiles !== 'string' || !value.smiles.trim()) {
    throw new Error('AI recognition response does not contain SMILES');
  }
  if (
    value.confidence !== undefined &&
    (typeof value.confidence !== 'number' ||
      value.confidence < 0 ||
      value.confidence > 1)
  ) {
    throw new Error('AI recognition confidence must be between 0 and 1');
  }

  return {
    smiles: value.smiles.trim(),
    confidence: value.confidence,
  };
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Unable to encode recognition image'));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read recognition image'));
    reader.readAsDataURL(blob);
  });
}

export class OpenAICompatibleRecognitionAdapter
  implements MoleculeRecognitionAdapter
{
  readonly provider = 'openai-compatible-vision';
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly parseSmiles: SmilesParser;
  private readonly fetch: FetchLike;

  constructor(config: OpenAICompatibleRecognitionConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.parseSmiles = config.parseSmiles;
    this.fetch = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async recognize(input: RecognizeImageInput): Promise<RecognizedMoleculeV1> {
    const imageUrl = await blobToDataUrl(input.image);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: [
                  'Read the skeletal chemical structure in the image.',
                  'Count every vertex and terminal line explicitly.',
                  'Return exactly one JSON object with keys smiles and confidence.',
                  'confidence must be a number from 0 to 1.',
                  'Do not return markdown, a molecule name, or an explanation.',
                ].join(' '),
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`AI recognition request failed with ${response.status}`);
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('AI recognition response has no text content');
    }

    const payload = parseAiRecognitionPayload(content);
    const structure = await this.parseSmiles(payload.smiles);
    return createRecognizedMolecule(this.provider, structure, {
      confidence: payload.confidence,
    });
  }
}
