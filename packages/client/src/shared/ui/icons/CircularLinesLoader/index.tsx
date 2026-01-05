export interface LoaderProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  animated?: boolean;
  radius?: number;
  speedInSeconds?: number;
  lineLength?: number;
  lineWidth?: number;
}

export const CircularLinesLoader: React.FC<LoaderProps> = ({
  size = 24,
  radius = 24,
  speedInSeconds = 1.1,
  lineLength = 10,
  lineWidth = 6,
  animated = true,
  ...props
}: LoaderProps) => {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
    >
      <g transform="translate(40,40)">
        {Array.from({ length: 8 }).map((_, i) => {
          const angleDeg = i * 45;
          const angleRad = angleDeg * (Math.PI / 180);

          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <line
              key={i}
              x1={x - lineLength / 2}
              y1={y}
              x2={x + lineLength / 2}
              y2={y}
              stroke="currentColor"
              strokeWidth={lineWidth}
              strokeLinecap="round"
              transform={`rotate(${angleDeg} ${x} ${y})`}
            >
              {animated && (
                <animate
                  attributeName="stroke-opacity"
                  values="1;.2;.2;.2;.2;.2;.2;.2;1"
                  keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1"
                  dur={`${speedInSeconds}s`}
                  begin={`${(i * (speedInSeconds / 8)).toFixed(4)}s`}
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}
      </g>
    </svg>
  );
};
