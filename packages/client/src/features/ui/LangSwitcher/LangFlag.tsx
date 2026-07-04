import { Image } from "~/shared/ui";
import { LANGUAGE_FLAGS, type Language } from "./constants";

type LangFlagProps = {
  code: Language;
  size?: number;
};

export const LangFlag = ({ code, size = 20 }: LangFlagProps) => (
  <Image
    src={LANGUAGE_FLAGS[code]}
    alt=""
    w={size}
    h={size}
    objectFit="cover"
    flexShrink={0}
  />
);
