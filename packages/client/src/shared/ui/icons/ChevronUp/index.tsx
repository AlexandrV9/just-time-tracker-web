import { withIconProps } from "../withIconProps";

export const ChevronUpIcon = withIconProps((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="m7 15l4.859-4.859a.2.2 0 0 1 .282 0L17 15"
      />
    </svg>
  );
});
