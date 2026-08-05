'use client'

import { useState, useEffect } from 'react'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'

interface Props {
  title: string
}

export default function ShareButtons({ title }: Props) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex flex-col gap-3 py-6 border-y border-slate-100">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5" /> Bagikan Artikel Ini
      </span>

      <div className="flex flex-wrap gap-2">
        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="h-10 px-3.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition flex items-center gap-1.5 cursor-pointer"
          title="Salin Tautan"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 animate-in fade-in zoom-in duration-300" />
              Tautan Disalin
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              Salin Tautan
            </>
          )}
        </button>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 hover:text-green-800 transition flex items-center justify-center cursor-pointer"
          title="Bagikan ke WhatsApp"
        >
          <svg className="w-4 h-4 fill-current text-green-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.851-4.415 9.854-9.851.002-2.634-1.02-5.11-2.881-6.974A9.774 9.774 0 0 0 12.008 1.83c-5.439 0-9.856 4.417-9.859 9.856-.001 1.937.525 3.826 1.52 5.511l-.994 3.63 3.731-.978zm10.155-6.84c.321-.16.321-.482.261-.581-.06-.1-.22-.16-.541-.321-.32-.16-1.895-.883-2.19-.99-.295-.107-.51-.16-.724.16-.214.32-.83.99-1.018 1.2-.188.21-.375.241-.696.08-.321-.16-1.353-.5-2.581-1.6-.955-.852-1.6-1.907-1.787-2.228-.188-.32-.02-.492.14-.652.143-.144.321-.375.482-.563.16-.188.214-.32.32-.536.107-.214.053-.4-.027-.563-.08-.16-.724-1.741-.99-2.385-.26-.643-.53-.553-.724-.563a5.12 5.12 0 0 0-.525-.008c-.295 0-.776.11-1.182.553-.406.446-1.547 1.513-1.547 3.689 0 2.176 1.58 4.28 1.8 4.582.22.301 3.109 4.747 7.533 6.656 1.053.454 1.874.725 2.516.929 1.059.336 2.023.288 2.783.175.847-.125 2.19-.896 2.497-1.764.306-.867.306-1.61.214-1.764z"/>
          </svg>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition flex items-center justify-center cursor-pointer"
          title="Bagikan ke X"
        >
          <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
          title="Bagikan ke Facebook"
        >
          <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 transition flex items-center justify-center cursor-pointer"
          title="Bagikan ke LinkedIn"
        >
          <svg className="w-4 h-4 fill-current text-indigo-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
