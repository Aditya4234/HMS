'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FALLBACK_IMAGES } from '@/lib/pexels';

interface RoomImageProps {
  src?: string;
  alt: string;
  fallbackIndex?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export function RoomImage({ src, alt, fallbackIndex = 0, fill, className, priority, width, height }: RoomImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length]);
  const [usedFallback, setUsedFallback] = useState(!src);

  const handleError = () => {
    if (!usedFallback) {
      setImgSrc(FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length]);
      setUsedFallback(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
}
