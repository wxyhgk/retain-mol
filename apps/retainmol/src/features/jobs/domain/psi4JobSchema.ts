import { z } from 'zod'

export const psi4JobFormSchema = z.object({
  kind: z.enum(['psi4-ts-refine', 'psi4-frequency', 'psi4-irc']),
  name: z.string().trim().max(160, '任务名称不能超过 160 个字符'),
  charge: z.number({ error: '请输入整数电荷' }).int().min(-20).max(20),
  multiplicity: z.number({ error: '请输入自旋多重度' }).int().min(1).max(20),
  method: z.string().trim().min(1, '请输入方法').max(64),
  basis: z.string().trim().min(1, '请输入基组').max(64),
  reference: z.enum(['auto', 'rhf', 'uhf', 'rohf']),
  scfType: z.enum(['df', 'pk']),
  threads: z.number({ error: '请输入线程数' }).int().min(1).max(16),
  memoryMb: z.number({ error: '请输入内存' }).int().min(256).max(32768),
  timeoutSeconds: z.number({ error: '请输入超时秒数' }).int().min(5).max(86400),
  maxSteps: z.number({ error: '请输入最大步数' }).int().min(1).max(3000),
  fullHessianEvery: z.number({ error: '请输入 Hessian 间隔' }).int().min(0).max(100),
  convergence: z.enum(['gau_loose', 'gau', 'gau_tight', 'gau_verytight']),
  direction: z.enum(['forward', 'backward', 'both']),
  points: z.number({ error: '请输入 IRC 点数' }).int().min(1).max(200),
  stepSize: z.number({ error: '请输入 IRC 步长' }).positive().max(2),
})

export type Psi4JobFormValues = z.infer<typeof psi4JobFormSchema>

export const defaultPsi4JobFormValues: Psi4JobFormValues = {
  kind: 'psi4-frequency',
  name: '',
  charge: 0,
  multiplicity: 1,
  method: 'b3lyp',
  basis: 'def2-svp',
  reference: 'auto',
  scfType: 'df',
  threads: 1,
  memoryMb: 2048,
  timeoutSeconds: 3600,
  maxSteps: 100,
  fullHessianEvery: 1,
  convergence: 'gau_tight',
  direction: 'both',
  points: 20,
  stepSize: 0.2,
}
