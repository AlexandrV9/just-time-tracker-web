import { useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

import styles from "./IOSPickerItem.module.css";
import clsx from "clsx";
import { WHEEL_ITEM_RADIUS, WHEEL_ITEM_SIZE } from "./constants";
import { setContainerStyles, setSlideStyles } from "./utils";

export type IOSPickerItemProps = {
  loop?: boolean;
  label: string;
  slideCount: number;
  perspective: "left" | "right" | "center";
  value?: number;
  onValueChange?: (value: number) => void;
};

export const IOSPickerItem = ({
  slideCount,
  perspective,
  label,
  loop = false,
  value,
  onValueChange,
}: IOSPickerItemProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    axis: "y",
    dragFree: true,
    containScroll: false,
    watchSlides: false,
    dragThreshold: 1,
  });

  const rootNodeRef = useRef<HTMLDivElement>(null);
  const totalRadius = slideCount * WHEEL_ITEM_RADIUS;
  const rotationOffset = loop ? 0 : WHEEL_ITEM_RADIUS;
  const slides = Array.from(Array(slideCount).keys());

  // Функция для получения текущего выбранного значения
  const getSelectedValue = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;

    const selectedIndex = emblaApi.selectedScrollSnap();
    return selectedIndex;
  }, []);

  useEffect(() => {
    if (!emblaApi || value === undefined) return;

    const currentIndex = emblaApi.selectedScrollSnap();
    if (currentIndex !== value) {
      emblaApi.scrollTo(value, true);
    }
  }, [emblaApi, value]);

  // Обработчик изменения выбранного элемента
  const handleSelectionChange = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const selectedValue = getSelectedValue(emblaApi);
      if (selectedValue !== undefined && onValueChange) {
        onValueChange(selectedValue);
      }
    },
    [getSelectedValue, onValueChange]
  );

  const inactivateEmblaTransform = useCallback(
    (emblaApi: EmblaCarouselType) => {
      if (!emblaApi) return;

      const { translate, slideLooper } = emblaApi.internalEngine();

      translate.clear();
      translate.toggleActive(false);
      slideLooper.loopPoints.forEach(({ translate }) => {
        translate.clear();
        translate.toggleActive(false);
      });
    },
    []
  );

  const rotateWheel = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const rotation = slideCount * WHEEL_ITEM_RADIUS - rotationOffset;
      const wheelRotation = rotation * emblaApi.scrollProgress();

      setContainerStyles(emblaApi, wheelRotation);

      emblaApi.slideNodes().forEach((_, index) => {
        setSlideStyles(emblaApi, index, loop, slideCount, totalRadius);
      });
    },
    [slideCount, rotationOffset, totalRadius]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const handleReInit = (emblaApi: EmblaCarouselType) => {
      inactivateEmblaTransform(emblaApi);
      rotateWheel(emblaApi);
      handleSelectionChange(emblaApi);
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
    emblaApi.on("select", handleSelectionChange);
    emblaApi.on("reInit", handleReInit);

    inactivateEmblaTransform(emblaApi);
    rotateWheel(emblaApi);

    setTimeout(() => handleSelectionChange(emblaApi), 50);
  }, [emblaApi, inactivateEmblaTransform, rotateWheel, handleSelectionChange]);

  return (
    <div className={styles.container}>
      <div className={styles.scene} ref={rootNodeRef}>
        <div
          className={clsx(
            styles.viewport,
            styles[`viewport--perspective-${perspective}`]
          )}
          ref={emblaRef}
        >
          <div className={styles.slides}>
            {slides.map((_, index) => (
              <div className={styles.slide} key={index}>
                {index}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};
