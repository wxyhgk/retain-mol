import type { FieldSchema } from '../types'
import { cn } from '@/lib/utils'

interface Props {
  schema: FieldSchema[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export default function JobForm({ schema, values, onChange }: Props) {
  if (schema.length === 0) return null
  return (
    <div className="space-y-2">
      {schema.map(field => {
        if (field.kind === 'select') return (
          <div key={field.key} className="flex items-start gap-2">
            <span className="text-[11px] text-gray-500 w-10 shrink-0 pt-0.5">{field.label}</span>
            <div className="flex flex-wrap gap-1">
              {field.options.map(opt => (
                <button key={opt.value} onClick={() => onChange(field.key, opt.value)}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] border transition-colors',
                    values[field.key] === opt.value
                      ? 'bg-[#007AFF] border-[#007AFF] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )

        if (field.kind === 'number') return (
          <div key={field.key} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-10 shrink-0">{field.label}</span>
            <input
              type="number"
              min={field.min} max={field.max} step={field.step ?? 1}
              value={(values[field.key] as number) ?? 0}
              onChange={e => onChange(field.key, Number(e.target.value))}
              className="w-16 text-xs border border-gray-200 rounded px-2 py-0.5 text-center focus:outline-none focus:border-[#007AFF]"
            />
          </div>
        )

        if (field.kind === 'toggle') return (
          <div key={field.key} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-10 shrink-0">{field.label}</span>
            <button
              onClick={() => onChange(field.key, !values[field.key])}
              className={cn('relative w-8 h-4 rounded-full transition-colors', values[field.key] ? 'bg-[#007AFF]' : 'bg-gray-300')}
            >
              <span className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                values[field.key] ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        )

        return null
      })}
    </div>
  )
}
