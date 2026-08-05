import { PortableText as SanityPortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface Props {
  value: PortableTextBlock[]
  className?: string
}

export function PortableText({ value, className }: Props) {
  if (!value || !Array.isArray(value)) return null
  return (
    <div className={className || 'prose prose-slate max-w-none'}>
      <SanityPortableText value={value} />
    </div>
  )
}
