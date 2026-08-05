import * as React from 'react'
import { Controller, ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface SelectFieldProps<TFieldValues extends FieldValues>
  extends Omit<ControllerProps<TFieldValues>, 'render'> {
  label?: string
  placeholder?: string
  options: readonly string[]
  error?: string
}

export function SelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  options,
  error,
  rules,
}: SelectFieldProps<TFieldValues>) {
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
          <select
            id={name as string}
            required={isRequired}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border',
              'border-slate-300 bg-white px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500'
            )}
            {...field}
            value={field.value ?? ''}
            onChange={(e) => {
              const val = e.target.value
              field.onChange(val === '' ? undefined : val)
            }}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    />
  )
}
