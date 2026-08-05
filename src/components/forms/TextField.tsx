import * as React from 'react'
import { Controller, ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TextFieldProps<TFieldValues extends FieldValues>
  extends Omit<ControllerProps<TFieldValues>, 'render'> {
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'number'
  disabled?: boolean
  error?: string
}

export function TextField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  rules,
}: TextFieldProps<TFieldValues>) {
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
          <Input
            id={name as string}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            required={isRequired}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
            {...field}
            value={field.value ?? ''}
            onChange={(e) => {
              const val = e.target.value
              if (type === 'number') {
                field.onChange(val === '' ? undefined : Number(val))
              } else if (val === '') {
                field.onChange(undefined)
              } else {
                field.onChange(val)
              }
            }}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    />
  )
}