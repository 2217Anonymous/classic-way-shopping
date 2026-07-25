"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

export default function HeroParallaxImage({ src, alt, priority }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    transform:
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
  });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    // Parallel / tilt — stronger on Y for 3D feel
    const rotateY = ((x - midX) / midX) * 14;
    const rotateX = ((midY - y) / midY) * 10;
    const translateZ = 24;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(1.04)`,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({
      transform:
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      className="hero-parallax"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="hero-parallax-inner" style={style}>
        <div className="hero-parallax-shadow" aria-hidden />
        <div className="hero-parallax-img">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-contain object-center select-none pointer-events-none"
            sizes="(max-width: 768px) 90vw, 520px"
          />
        </div>
      </div>
    </div>
  );
}
