// import { useState, useCallback, useRef } from "react";

// type CircularProgressProps = {
//   size?: number;
//   segments?: number;
//   progress?: number;
//   animated?: boolean;
//   speed?: number; // ms за круг
// };

// export function CircularProgress({
//   size = 300,
//   segments = 60,
//   progress = 65,
//   speed = 7000, // Время полного оборота в мс
// }: CircularProgressProps) {
//   const rafId = useRef<number | null>(null);
//   const phaseRef = useRef(0);
//   const lastTimeRef = useRef<number | null>(null);

//   const [phase, setPhase] = useState(0);

//   const radius = size / 2 - 10;
//   const center = size / 2;
//   const lineLength = 15;
//   const activeSpan = (segments * progress) / 100;

//   const animate = useCallback(
//     (currentTime: number) => {
//       if (!lastTimeRef.current) {
//         lastTimeRef.current = currentTime;
//       }

//       const delta = currentTime - lastTimeRef.current;
//       lastTimeRef.current = currentTime;

//       const progressDelta = (delta / speed) * segments;
//       phaseRef.current = (phaseRef.current + progressDelta) % segments;

//       setPhase(Math.floor(phaseRef.current));

//       rafId.current = requestAnimationFrame(animate);
//     },
//     [segments, speed]
//   );

//   const startAnimation = useCallback(() => {
//     if (rafId.current) return;

//     lastTimeRef.current = null;
//     rafId.current = requestAnimationFrame(animate);
//   }, [animate]);

//   const stopAnimation = useCallback(() => {
//     if (rafId.current) {
//       cancelAnimationFrame(rafId.current);
//       rafId.current = null;
//     }
//     lastTimeRef.current = null;
//   }, []);

//   const BASE_OPACITY = 0.25;
//   const ACCENT_OPACITY = 0.75;

//   return (
//     <div style={{ position: "relative", width: size, height: size }}>
//       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//         {Array.from({ length: segments }).map((_, i) => {
//           const angle = (360 / segments) * i;
//           const diff = (i - phase + segments) % segments;
//           const intensity = Math.max(0, Math.min(1, 1 - diff / activeSpan));
//           const opacity = BASE_OPACITY + ACCENT_OPACITY * intensity;

//           return (
//             <line
//               key={i}
//               x1={center}
//               y1={center - radius}
//               x2={center}
//               y2={center - radius + lineLength}
//               stroke="#c4b5fd"
//               strokeWidth={6}
//               strokeLinecap="round"
//               //   opacity={opacity}
//               transform={`rotate(${angle} ${center} ${center})`}
//             />
//           );
//         })}

//         <text
//           x="50%"
//           y="50%"
//           fill="white"
//           fontSize="48"
//           fontWeight="600"
//           textAnchor="middle"
//           dominantBaseline="middle"
//           style={{
//             fontSize: 40,
//           }}
//         >
//             19:20
//           {/* {Math.round(progress)}% */}
//         </text>
//       </svg>

//       <div
//         style={{
//           position: "absolute",
//           bottom: -50,
//           left: "50%",
//           transform: "translateX(-50%)",
//         }}
//       >
//         <button onClick={startAnimation} style={{ marginRight: 10 }}>
//           Start
//         </button>
//         <button onClick={stopAnimation}>Stop</button>
//       </div>
//     </div>
//   );
// }
