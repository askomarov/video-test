"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const FAKE_DELAY_MS = 2500;

type MediaSize = { width: number; height: number };

const slides = [
  {
    type: "video" as const,
    src: "/test-video-3.mp4",
    preview: "/slide-image.jpg",
  },
  { type: "image" as const, src: "/1-beonix-squerish.webp" },
  { type: "video" as const, src: "/test-video-2.mp4", preview: "/preview.jpg" },
  { type: "image" as const, src: "/fg-2560-1080.webp" },
  {
    type: "video" as const,
    src: "/reflect_aero_1920_sound_1.webm",
    preview: "/air-preview.jpg",
  },
  { type: "image" as const, src: "/fg-2.webp" },
  { type: "image" as const, src: "/1-beonix-squerish.webp" },
];

function loadImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export default function GallerySlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [mediaSizes, setMediaSizes] = useState<(MediaSize | null)[] | null>(
    null,
  );
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      slides.map(async (slide) => {
        const src = slide.type === "image" ? slide.src : slide.preview;
        try {
          return await loadImageSize(src);
        } catch {
          return null;
        }
      }),
    ).then((sizes) => {
      if (!cancelled) setMediaSizes(sizes);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const syncButtons = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };

    syncButtons();
    emblaApi.on("select", syncButtons).on("reInit", syncButtons);

    return () => {
      emblaApi.off("select", syncButtons).off("reInit", syncButtons);
    };
  }, [emblaApi]);

  // Ставим src у video через DOM — без setState и без замены img→video
  useEffect(() => {
    if (!emblaApi || !mediaSizes) return;

    const started = new Set<string>();
    const timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const el = entry.target as HTMLElement;
          const src = el.dataset.src;
          if (!src || el.dataset.type !== "video" || started.has(src)) continue;

          const video = el.querySelector("video");
          if (!video || video.dataset.loaded === "true") continue;

          started.add(src);
          timers.push(
            setTimeout(() => {
              video.dataset.loaded = "true";
              video.src = src;
              video.load();
              void video.play().catch(() => {});
            }, FAKE_DELAY_MS),
          );
        }
      },
      { root: null, threshold: 0.25, rootMargin: "100px" },
    );

    emblaApi.slideNodes().forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [emblaApi, mediaSizes]);

  if (!mediaSizes) return null;

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container items-center">
          {slides.map((slide, index) => {
            const size = mediaSizes[index];

            return (
              <div
                key={`${slide.src}-${index}`}
                className="embla__slide"
                data-type={slide.type}
                data-src={slide.src}
              >
                <div className="relative overflow-hidden">
                  {slide.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.src} alt="Slide" loading="lazy" />
                  ) : (
                    <div className="relative">
                      <video
                        poster={slide.preview}
                        muted
                        playsInline
                        loop
                        controls
                        preload="none"
                        style={
                          size
                            ? { aspectRatio: `${size.width} / ${size.height}` }
                            : undefined
                        }
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.preview}
                        alt=""
                        className="embla__poster-blur blur-lg -z-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="embla__controls">
        <div className="embla__buttons">
          <button
            className="embla__button"
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={prevBtnDisabled}
          >
            prev
          </button>
          <button
            className="embla__button"
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={nextBtnDisabled}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
}
