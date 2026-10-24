import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

/**
 * Действие, отложенное до момента, когда React отрисует новый набор слайдов:
 * до этого `reInit` померил бы ещё старый DOM.
 */
type PendingAction =
  | { type: "prepend"; anchorKey: string | null }
  | { type: "append" }
  | { type: "rebuild"; centerIndex: number };

/**
 * После программной прокрутки Embla не всегда присылает `settle`
 * (например, при переходе на тот же индекс), поэтому блокировку событий
 * снимаем ещё и по таймауту.
 */
const SYNC_RELEASE_DELAY_MS = 80;

type UseHorizontalCarouselParams = {
  /** Начальный набор ключей слайдов. `startIndex` должен указывать внутрь него. */
  initialKeys: string[];
  /** Индекс, на котором стоим после монтирования (обычно середина `initialKeys`). */
  startIndex: number;
  /** На сколько ключей наращиваем ленту у края. По умолчанию 12. */
  growBy?: number;
  /** Запас в слайдах до края, при котором запускается наращивание. По умолчанию 2. */
  edge?: number;
  getKeysBefore: (firstKey: string, count: number) => string[];
  getKeysAfter: (lastKey: string, count: number) => string[];
};

type UseHorizontalCarouselResult = {
  viewportRef: ReturnType<typeof useEmblaCarousel>[0];
  keys: string[];
  /** Следует за пальцем — обновляется по событию `select`. */
  activeIndex: number;
  /** Обновляется только после остановки — безопасно для запросов данных. */
  settledIndex: number;
  scrollPrev: () => void;
  scrollNext: () => void;
  /**
   * Заменяет ленту на `nextKeys` и мгновенно встаёт на `centerIndex`.
   * Нужно для дальних прыжков (выбор месяца и т. п.).
   */
  rebuild: (nextKeys: string[], centerIndex: number) => void;
};

/**
 * Горизонтальная «бесконечная» карусель поверх Embla.
 *
 * Хук ничего не знает о предметной области: он оперирует ключами слайдов
 * и просит новые порции у `getKeysBefore` / `getKeysAfter`, когда лента
 * подходит к краю.
 */
export function useHorizontalCarousel({
  initialKeys,
  startIndex,
  growBy = 12,
  edge = 2,
  getKeysBefore,
  getKeysAfter,
}: UseHorizontalCarouselParams): UseHorizontalCarouselResult {
  const [keys, setKeys] = useState(initialKeys);

  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [settledIndex, setSettledIndex] = useState(startIndex);

  const keysRef = useLatestRef(keys);
  const startIndexRef = useLatestRef(startIndex);

  const pendingActionRef = useRef<PendingAction | null>(null);

  /** Пока true — события Embla игнорируем: позицию меняем мы, а не пользователь. */
  const isSyncingRef = useRef(false);

  const [viewportRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    align: "start",
    loop: false,
    startIndex,
    containScroll: false,
    watchDrag: true,
    // reInit после наращивания вызываем вручную — иначе MutationObserver
    // сделает второй reInit и прокрутка дёрнется.
    watchSlides: false,
  });

  /** Досыпает слайды, если текущий индекс подошёл к краю ленты. */
  const requestGrow = useCallback(
    (index: number) => {
      if (pendingActionRef.current) return;

      const currentKeys = keysRef.current;

      if (index <= edge) {
        // Слева индексы сдвинутся, поэтому запоминаем ключ текущего слайда:
        // после вставки встанем на него же.
        pendingActionRef.current = {
          type: "prepend",
          anchorKey: currentKeys[index] ?? null,
        };
        setKeys((prev) => [...getKeysBefore(prev[0], growBy), ...prev]);
        return;
      }

      if (index >= currentKeys.length - 1 - edge) {
        pendingActionRef.current = { type: "append" };
        setKeys((prev) => [
          ...prev,
          ...getKeysAfter(prev[prev.length - 1], growBy),
        ]);
      }
    },
    [edge, growBy, getKeysBefore, getKeysAfter, keysRef],
  );

  const requestGrowRef = useLatestRef(requestGrow);

  const rebuild = useCallback((nextKeys: string[], centerIndex: number) => {
    pendingActionRef.current = { type: "rebuild", centerIndex };
    isSyncingRef.current = true;
    setKeys(nextKeys);
    setActiveIndex(centerIndex);
    setSettledIndex(centerIndex);
  }, []);

  // Новые слайды уже в DOM — синхронизируем с ними Embla.
  useLayoutEffect(() => {
    const action = pendingActionRef.current;
    if (!emblaApi || !action) return;

    pendingActionRef.current = null;
    isSyncingRef.current = true;

    const targetIndex = resolveTargetIndex(action, keys, emblaApi, growBy);

    emblaApi.reInit();
    emblaApi.scrollTo(targetIndex, true);

    setActiveIndex(targetIndex);
    setSettledIndex(targetIndex);

    const timeoutId = window.setTimeout(() => {
      isSyncingRef.current = false;
    }, SYNC_RELEASE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [keys, emblaApi, growBy]);

  useEffect(() => {
    if (!emblaApi) return;

    // `select` — цель прокрутки сменилась, палец ещё в движении: обновляем
    // активный индекс и наращиваем ленту заранее, до упора в край.
    const handleSelect = () => {
      if (isSyncingRef.current) return;

      const index = emblaApi.selectedScrollSnap();
      setActiveIndex(index);
      requestGrowRef.current(index);
    };

    // `settle` — прокрутка завершилась. Только здесь двигаем settledIndex,
    // чтобы не слать запрос на каждый промежуточный слайд.
    const handleSettle = () => {
      isSyncingRef.current = false;

      const index = emblaApi.selectedScrollSnap();
      setActiveIndex(index);
      setSettledIndex(index);
    };

    emblaApi.on("select", handleSelect);
    emblaApi.on("settle", handleSettle);

    // Embla учитывает startIndex при инициализации, но при containScroll: false
    // надёжнее явно встать на нужный слайд после первого замера.
    emblaApi.scrollTo(startIndexRef.current, true);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("settle", handleSettle);
    };
  }, [emblaApi, requestGrowRef, startIndexRef]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return {
    viewportRef,
    keys,
    activeIndex,
    settledIndex,
    scrollPrev,
    scrollNext,
    rebuild,
  };
}

/** Индекс, на который нужно встать после применения отложенного действия. */
function resolveTargetIndex(
  action: PendingAction,
  keys: string[],
  emblaApi: EmblaCarouselType,
  growBy: number,
): number {
  switch (action.type) {
    case "rebuild":
      return action.centerIndex;
    case "prepend": {
      // Все индексы сдвинулись ровно на growBy — это и есть запасной вариант,
      // если якорный ключ по какой-то причине не нашёлся.
      const anchorIndex = action.anchorKey
        ? keys.indexOf(action.anchorKey)
        : -1;

      return anchorIndex >= 0 ? anchorIndex : growBy;
    }

    case "append":
      // Справа индексы не сдвигаются — остаёмся на том же слайде.
      return emblaApi.selectedScrollSnap();
  }
}

/** Ref, всегда указывающий на свежее значение: держит обработчики стабильными. */
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}
