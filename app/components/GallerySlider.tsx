"use client";

import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

const FAKE_DELAY_MS = 2500;
const SLIDE_SIZE_VARS_EVENT = "slide-size-vars";

type MediaSize = { width: number; height: number };

const slides = [
  {
    type: "video" as const,
    src: "/test-video-3.mp4",
    preview: "/slide-image.jpg",
  },
  { type: "image" as const, src: "https://placehold.co/328x184" },
  { type: "image" as const, src: "https://placehold.co/656x368" },
  { type: "image" as const, src: "https://placehold.co/198x328" },
  { type: "image" as const, src: "https://placehold.co/396x656" },
  { type: "image" as const, src: "https://placehold.co/1980x728" },
  { type: "image" as const, src: "https://placehold.co/768x1220" },
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
  return new Promise<MediaSize>((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function readMaxBox() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:-99999px;top:0;width:var(--slide-max-width);height:var(--slide-max-height);pointer-events:none;visibility:hidden;";
  document.body.appendChild(probe);
  const { width, height } = probe.getBoundingClientRect();
  probe.remove();
  return {
    maxW: Math.max(1, width),
    maxH: Math.max(1, height),
  };
}

function fitSize(size: MediaSize, maxW: number, maxH: number): MediaSize {
  const scale = Math.min(maxW / size.width, maxH / size.height, 1);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

export default function GallerySlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });
  const [mediaSizes, setMediaSizes] = useState<(MediaSize | null)[] | null>(
    null,
  );
  const [fittedSizes, setFittedSizes] = useState<(MediaSize | null)[] | null>(
    null,
  );
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const skipNextReInit = useRef(true);

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

  // Пиксельный размер коробки — не зависит от intrinsic size video
  useEffect(() => {
    if (!mediaSizes) return;

    const updateFitted = () => {
      const { maxW, maxH } = readMaxBox();
      setFittedSizes(
        mediaSizes.map((size) => (size ? fitSize(size, maxW, maxH) : null)),
      );
    };

    updateFitted();
    window.addEventListener("resize", updateFitted);
    window.addEventListener(SLIDE_SIZE_VARS_EVENT, updateFitted);

    return () => {
      window.removeEventListener("resize", updateFitted);
      window.removeEventListener(SLIDE_SIZE_VARS_EVENT, updateFitted);
    };
  }, [mediaSizes]);

  useEffect(() => {
    if (!emblaApi || !fittedSizes) return;
    // Первый mount Embla уже меряет актуальные px — reInit только на resize/tweak
    if (skipNextReInit.current) {
      skipNextReInit.current = false;
      return;
    }
    emblaApi.reInit();
  }, [emblaApi, fittedSizes]);

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

  // Ставим src у video через DOM; превью-оверлей прячем только после playing
  useEffect(() => {
    if (!emblaApi || !fittedSizes) return;

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
          const cover = el.querySelector<HTMLElement>(".embla__poster-cover");
          const loader = el.querySelector<HTMLElement>(".embla__loader");
          if (!video || video.dataset.loaded === "true") continue;

          started.add(src);
          loader?.classList.add("is-active");

          timers.push(
            setTimeout(() => {
              video.dataset.loaded = "true";

              const reveal = () => {
                cover?.classList.add("is-hidden");
                loader?.classList.remove("is-active");
                loader?.classList.add("is-hidden");
              };

              video.addEventListener("playing", reveal, { once: true });
              // fallback если autoplay заблокирован, но кадр уже есть
              video.addEventListener(
                "loadeddata",
                () => {
                  if (!video.paused) reveal();
                },
                { once: true },
              );

              video.src = src;
              void video.play().catch(() => {
                // даже без play показываем первый кадр, когда он готов
                video.addEventListener("loadeddata", reveal, { once: true });
              });
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
  }, [emblaApi, fittedSizes]);

  if (!mediaSizes || !fittedSizes) return null;

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container items-center">
          {slides.map((slide, index) => {
            const fitted = fittedSizes[index];

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
                    <div
                      className="embla__media"
                      style={
                        fitted
                          ? { width: fitted.width, height: fitted.height }
                          : undefined
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.preview}
                        alt=""
                        className="embla__poster-blur blur-lg"
                      />
                      <video
                        className="embla__media-el"
                        muted
                        playsInline
                        loop
                        controls
                        preload="none"
                      />
                      {/* Реальное превью поверх — Safari не мигает пустым video */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.preview}
                        alt=""
                        className="embla__poster-cover"
                      />
                      <div className="embla__loader" aria-hidden="true">
                        <span className="embla__spinner" />
                      </div>
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
