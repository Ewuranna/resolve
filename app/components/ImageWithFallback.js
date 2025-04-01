'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback({ src, fallbackSrc, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}