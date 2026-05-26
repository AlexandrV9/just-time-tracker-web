import { useEffect, useRef, type ReactNode } from "react";
import { useHeaderStore } from "./useHeaderStore";

export function useHeaderContent(
  position: "left" | "center" | "right",
  content: ReactNode
) {
  const getContent = useHeaderStore((state) => state.getContent);
  const setContent = useHeaderStore((state) => state.setContent);
  const prevContent = useRef<ReactNode>(null);

  useEffect(() => {
    prevContent.current = getContent(position);
    setContent(position, content);

    return () => {
      setContent(position, prevContent.current);
    };
  }, [position, content, getContent, setContent]);
}

export const useHeaderLeftContent = (content: ReactNode) => {
  return useHeaderContent("left", content);
};

export const useHeaderCenterContent = (content: ReactNode) => {
  return useHeaderContent("center", content);
};

export const useHeaderRightContent = (content: ReactNode) => {
  return useHeaderContent("right", content);
};
