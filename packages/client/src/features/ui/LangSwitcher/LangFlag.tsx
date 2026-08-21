import { Image } from "~/shared/ui";
import { LANGUAGES_CONFIG, type Language } from "./constants";

type LangFlagProps = {
  code: Language;
  size?: number;
};

export const LangFlag = ({ code, size = 20 }: LangFlagProps) => {
  const { path, alt } = LANGUAGES_CONFIG[code];

  return (
    <Image
      src={path}
      alt={alt}
      w={typeof size === "number" ? `${size}px` : size}
      h={typeof size === "number" ? `${size}px` : size}
      objectFit="cover"
      flexShrink={0}
    />
  );
};
