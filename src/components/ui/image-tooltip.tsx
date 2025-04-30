'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageTooltipProps {
  /**
   * URL gambar yang akan ditampilkan
   */
  imageUrl: string;
  
  /**
   * Teks alternatif untuk gambar
   */
  alt: string;
  
  /**
   * Konten yang akan menjadi trigger tooltip
   */
  children: ReactNode;
  
  /**
   * Ukuran gambar thumbnail (width dan height)
   * @default 40
   */
  thumbnailSize?: number;
  
  /**
   * Ukuran gambar preview dalam tooltip (width dan height)
   * @default 160
   */
  previewSize?: number;
  
  /**
   * Posisi tooltip relatif terhadap trigger
   * @default "right"
   */
  side?: "top" | "right" | "bottom" | "left";
  
  /**
   * Kelas tambahan untuk container thumbnail
   */
  thumbnailClassName?: string;
  
  /**
   * Kelas tambahan untuk container preview
   */
  previewClassName?: string;
}

/**
 * Komponen ImageTooltip menampilkan gambar thumbnail yang ketika dihover
 * akan menampilkan gambar yang lebih besar dalam tooltip.
 */
export function ImageTooltip({
  imageUrl,
  alt,
  children,
  thumbnailSize = 40,
  previewSize = 160,
  side = "right",
  thumbnailClassName,
  previewClassName,
}: ImageTooltipProps) {
  // Gunakan placeholder jika imageUrl tidak tersedia
  const imageSrc = imageUrl || '/placeholder.svg';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="p-0 border-0 bg-transparent">
          <div 
            className={`relative overflow-hidden rounded-md shadow-lg ${previewClassName}`}
            style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes={`${previewSize}px`}
              className="object-cover"
              priority
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Komponen ProductImageTooltip khusus untuk menampilkan gambar produk dengan thumbnail dan preview.
 */
export function ProductImageTooltip({
  imageUrl,
  alt,
  thumbnailSize = 40,
  previewSize = 160,
  side = "right",
  thumbnailClassName,
  previewClassName,
}: Omit<ImageTooltipProps, 'children'>) {
  // Gunakan placeholder jika imageUrl tidak tersedia
  const imageSrc = imageUrl || '/placeholder.svg';
  
  return (
    <ImageTooltip
      imageUrl={imageSrc}
      alt={alt}
      thumbnailSize={thumbnailSize}
      previewSize={previewSize}
      side={side}
      thumbnailClassName={thumbnailClassName}
      previewClassName={previewClassName}
    >
      <div 
        className={`relative overflow-hidden rounded-md cursor-pointer ${thumbnailClassName}`}
        style={{ width: `${thumbnailSize}px`, height: `${thumbnailSize}px` }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={`${thumbnailSize}px`}
          className="object-cover"
        />
      </div>
    </ImageTooltip>
  );
}