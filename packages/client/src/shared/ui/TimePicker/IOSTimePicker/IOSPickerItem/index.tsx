import { useEffect, useCallback, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import clsx from "clsx";

import styles from "./IOSPickerItem.module.css";
import { WHEEL_ITEM_RADIUS, WHEEL_ITEM_SIZE } from "./constants";
import { formatTime, setContainerStyles, setSlideStyles } from "./utils";

export type IOSPickerItemProps = {
  label: string;
  slideCount: number;
  step?: number;
  loop?: boolean;
  perspective: "left" | "right" | "center";
  value?: number;
  onValueChange?: (value: number) => void;
};

export const IOSPickerItem = ({
  slideCount,
  step = 1,
  loop = false,
  perspective,
  label,
  value,
  onValueChange,
}: IOSPickerItemProps) => {
  const slides = useMemo(
    () =>
      Array.from({ length: Math.ceil(slideCount / step) }, (_, i) => i * step),
    [slideCount, step]
  );

  const isFirstRender = useRef(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop,
    dragFree: true,
    containScroll: false,
    skipSnaps: false,
  });

  const totalRadius = slides.length * WHEEL_ITEM_RADIUS;
  const rotationOffset = loop ? 0 : WHEEL_ITEM_RADIUS;

  useEffect(() => {
    if (!emblaApi || value === undefined || !isFirstRender.current) return;

    const index = slides.indexOf(value);
    if (index < 0) return;

    isFirstRender.current = false;
    emblaApi.scrollTo(index, true);
  }, [emblaApi, value, slides]);

  const rotateWheel = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const rotation = slides.length * WHEEL_ITEM_RADIUS - rotationOffset;
      const wheelRotation = rotation * emblaApi.scrollProgress();

      setContainerStyles(emblaApi, wheelRotation);

      emblaApi.slideNodes().forEach((_, index) => {
        setSlideStyles(emblaApi, index, loop, slides.length, totalRadius);
      });
    },
    [slides.length, rotationOffset, totalRadius, loop]
  );

  const emitValue = useCallback(
    (api: EmblaCarouselType) => {
      const index = api.selectedScrollSnap();
      const newValue = slides[index];

      if (newValue !== undefined) {
        onValueChange?.(newValue);
      }
    },
    [slides, onValueChange]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const handleReInit = (emblaApi: EmblaCarouselType) => {
      rotateWheel(emblaApi);
      emitValue(emblaApi);
    };

    const handlePointerUp = (emblaApi: EmblaCarouselType) => {
      const { scrollTo, target, location } = emblaApi.internalEngine();

      const diffToTarget = target.get() - location.get();
      const factor = Math.abs(diffToTarget) < WHEEL_ITEM_SIZE / 2.5 ? 10 : 0.1;
      const distance = diffToTarget * factor;
      scrollTo.distance(distance, true);
    };

    emblaApi.on("pointerUp", handlePointerUp);
    emblaApi.on("scroll", rotateWheel);
    emblaApi.on("select", emitValue);
    emblaApi.on("reInit", handleReInit);

    rotateWheel(emblaApi);
    emitValue(emblaApi);
  }, [emblaApi, rotateWheel, emitValue]);

  return (
    <div className={styles.container}>
      <div className={styles.scene}>
        <div
          className={clsx(
            styles.viewport,
            styles[`viewport--perspective-${perspective}`]
          )}
          ref={emblaRef}
        >
          <div className={styles.slides}>
            {slides.map((slide) => (
              <div className={styles.slide} key={slide}>
                {formatTime(slide)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};
