export type YandexLogoIconProps = React.SVGProps<SVGSVGElement> & {
  lang?: "ru" | "en";
};

export const YandexLogoIcon = ({
  lang = "ru",
  width = 24,
  height = 24,
  ...props
}: YandexLogoIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 745 745"
      width={width}
      height={height}
      {...props}
    >
      <circle cx="372.5" cy="372.5" r="372.5" fill="#FC3F1D" />

      {lang === "ru" ? (
        <path
          fill="#fff"
          d="M422.6 568.4H498v-433H388.3C278 135.3 220 192 220 275.5c0 66.7 31.8 105.9 88.5 146.4l-98.4 146.4h81.6l109.6-163.9-38-25.5c-46.1-31.1-68.5-55.4-68.5-107.8 0-46.1 32.4-77.3 94.1-77.3h33.6v374.6z"
        />
      ) : (
        <path
          fill="none"
          stroke="#fff"
          strokeWidth="78"
          strokeLinecap="butt"
          strokeLinejoin="round"
          d="M205 155 L372.5 360 L540 155 M372.5 360 L372.5 568"
        />
      )}
    </svg>
  );
};
