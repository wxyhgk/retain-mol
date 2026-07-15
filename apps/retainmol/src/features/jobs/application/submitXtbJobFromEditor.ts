import type { Molecule } from '@retainmol/mol-viewer/core'
import {
  useSaveMoleculeDocumentMutation,
  type MoleculeDocumentBinding,
  type SaveMoleculeDocumentInput,
  type SaveMoleculeDocumentResult,
} from '@/features/molecule-assets'
import type {
  CreateXtbOptimizationJobParameters,
  CreateXtbOptimizationJobRequest,
  JobDetail,
} from '../domain/jobTypes'
import { useCreateXtbJobMutation } from './jobQueries'

export interface SubmitXtbJobFromEditorInput {
  readonly objectId: string
  readonly molecule: Molecule
  readonly binding: MoleculeDocumentBinding | null
  readonly revisionMetadata?: Readonly<Record<string, unknown>>
  readonly parameters: CreateXtbOptimizationJobParameters
}

export interface SubmitXtbJobFromEditorResult {
  readonly job: JobDetail
  readonly revisionId: string
  readonly savedDocument: SaveMoleculeDocumentResult
}

type SaveDocument = (input: SaveMoleculeDocumentInput) => Promise<SaveMoleculeDocumentResult>
type CreateJob = (request: CreateXtbOptimizationJobRequest) => Promise<JobDetail>

/**
 * Freezes the editor working copy before a calculation is created. Jobs only
 * retain the immutable revision id, never a mutable editor snapshot.
 */
export async function submitXtbJobFromEditor(
  saveDocument: SaveDocument,
  createJob: CreateJob,
  input: SubmitXtbJobFromEditorInput,
): Promise<SubmitXtbJobFromEditorResult> {
  const savedDocument = await saveDocument({
    objectId: input.objectId,
    molecule: input.molecule,
    binding: input.binding,
    metadata: input.revisionMetadata,
  })
  const revisionId = savedDocument.binding?.headRevisionId
  if (!revisionId) throw new Error('当前分子未能生成可用于计算的版本')

  const job = await createJob({
    ...input.parameters,
    moleculeRevisionId: revisionId,
  })
  return { job, revisionId, savedDocument }
}

export function useSubmitXtbJobFromEditor() {
  const saveDocument = useSaveMoleculeDocumentMutation()
  const createJob = useCreateXtbJobMutation()

  return {
    submit: (input: SubmitXtbJobFromEditorInput) => submitXtbJobFromEditor(
      saveDocument.mutateAsync,
      createJob.mutateAsync,
      input,
    ),
    isPending: saveDocument.isPending || createJob.isPending,
    error: saveDocument.error ?? createJob.error,
  }
}
