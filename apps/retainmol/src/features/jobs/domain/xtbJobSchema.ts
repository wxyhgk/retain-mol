import { z } from 'zod'

export const xtbJobFormSchema = z.object({
  name: z.string().trim().max(120, '任务名称不能超过 120 个字符'),
  charge: z.number({ error: '请输入整数电荷' }).int('电荷必须是整数').min(-20).max(20),
  multiplicity: z.number({ error: '请输入自旋多重度' }).int().min(1).max(20),
  optLevel: z.enum(['normal', 'tight', 'vtight']),
  maxSteps: z.number({ error: '请输入最大步数' }).int().min(1).max(1000),
})

export type XtbJobFormValues = z.infer<typeof xtbJobFormSchema>

export const defaultXtbJobFormValues: XtbJobFormValues = {
  name: '',
  charge: 0,
  multiplicity: 1,
  optLevel: 'normal',
  maxSteps: 300,
}
