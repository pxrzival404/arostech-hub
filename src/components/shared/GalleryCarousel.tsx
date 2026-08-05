'use client'

import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import type { ImageAsset } from '@/lib/api/sanity/types'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

interface Props {
  images?: ImageAsset[]
  alt: string
}

export default function GalleryCarousel({ images, alt }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full bg-slate-100 flex flex-col items-center justify-center rounded-2xl border border-slate-200">
        <ImageIcon className="w-12 h-12 text-slate-300" />
        <span className="text-slate-500 text-xs mt-2">Tidak ada dokumentasi gambar</span>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[21/9] w-full bg-slate-100 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <Image
          src={getOptimizedImageUrl(images[0], 1200, 514) || ''}
          alt={alt}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Viewport */}
      <div className="relative aspect-[21/9] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((image, idx) => (
              <div key={image._key || idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                <Image
                  src={getOptimizedImageUrl(image, 1200, 514) || ''}
                  alt={`${alt} - ${idx + 1}`}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority={idx === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrow Controls */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 transition hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 transition hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Index Badge */}
        <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold select-none">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className="group min-w-6 min-h-6 flex items-center justify-center cursor-pointer"
            aria-label={`Slide ke-${index + 1}`}
            aria-current={selectedIndex === index ? "true" : "false"}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                selectedIndex === index ? 'bg-blue-600 w-6' : 'bg-slate-300 group-hover:bg-slate-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
