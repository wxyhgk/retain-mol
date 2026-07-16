import type { Molecule } from '@retainmol/mol-viewer/core'
import {
  useSaveMoleculeDocumentMutation,
  type MoleculeDocumentBinding,
  type SaveMoleculeDocumentInput,
  type SaveMoleculeDocumentResult,
} from '@/features/molecule-assets'
import type {
  JobDetail,
  Psi4CalculationKind,
  Psi4CreateMutationInput,
  Psi4JobParametersByKind,
} from '../domain/jobTypes'
import { useCreatePsi4JobMutation } from './jobQueries'

export interface SubmitPsi4JobFromEditorInput<Kind extends Psi4CalculationKind = Psi4CalculationKind> {
  readonly objectId: string
  readonly molecule: Molecule
  readonly binding: MoleculeDocumentBinding | null
  readonly revisionMetadata?: Readonly<Record<string, unknown>>
  readonly kind: Kind
  readonly parameters: Psi4JobParametersByKind[Kind]
}

export interface SubmitPsi4JobFromEditorResult {
  readonly job: JobDetail
  readonly revisionId: string
  readonly savedDocument: SaveMoleculeDocumentResult
}

type SaveDocument = (input: SaveMoleculeDocumentInput) => Promise<SaveMoleculeDocumentResult>
type CreateJob = (input: Psi4CreateMutationInput) => Promise<JobDetail>

export async function submitPsi4JobFromEditor<Kind extends Psi4CalculationKind>(
  saveDocument: SaveDocument,
  createJob: CreateJob,
  input: SubmitPsi4JobFromEditorInput<Kind>,
): Promise<SubmitPsi4JobFromEditorResult> {
  const savedDocument = await saveDocument({
    objectId: input.objectId,
    molecule: input.molecule,
    binding: input.binding,
    metadata: input.revisionMetadata,
  })
  const revisionId = savedDocument.binding?.headRevisionId
  if (!revisionId) throw new Error('当前分子未能生成可用于计算的版本')

  const job = await createJob({
    kind: input.kind,
    request: { ...input.parameters, moleculeRevisionId: revisionId },
  } as Psi4CreateMutationInput)
  return { job, revisionId, savedDocument }
}

export function useSubmitPsi4JobFromEditor() {
  const saveDocument = useSaveMoleculeDocumentMutation()
  const createJob = useCreatePsi4JobMutation()

  return {
    submit: <Kind extends Psi4CalculationKind>(input: SubmitPsi4JobFromEditorInput<Kind>) =>
      submitPsi4JobFromEditor(saveDocument.mutateAsync, createJob.mutateAsync, input),
    isPending: saveDocument.isPending || createJob.isPending,
    error: saveDocument.error ?? createJob.error,
  }
}
