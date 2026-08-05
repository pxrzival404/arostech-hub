import * as React from 'react'
import { Controller, ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface TextareaFieldProps<TFieldValues extends FieldValues>
  extends Omit<ControllerProps<TFieldValues>, 'render'> {
  label?: string
  placeholder?: string
  rows?: number
  error?: string
}

export function TextareaField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  rows = 3,
  error,
  rules,
}: TextareaFieldProps<TFieldValues>) {
  const isRequired = !!(rules && ('required' in rules) && rules.required)

  return (
    <Controller
      name={name as FieldPath<TFieldValues>}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="space-y-2">
          {label && (
            <label
              htmlFor={name as string}
              className="block text-sm font-medium text-slate-700"
            >
              {label}
            </label>
          )}
          <textarea
            id={name as string}
            placeholder={placeholder}
            rows={rows}
            required={isRequired}
            className={cn(
              'flex w-full rounded-md border border-slate-300 bg-transparent',
              'px-3 py-2 text-sm placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed resize-y',
              error && 'border-red-500 focus:ring-red-500'
            )}
            {...field}
            value={field.value ?? ''}
            onChange={(e) => {
              const val = e.target.value
              field.onChange(val === '' ? undefined : val)
            }}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    />
  )
}