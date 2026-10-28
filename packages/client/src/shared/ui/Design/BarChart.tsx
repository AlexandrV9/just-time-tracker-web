import styles from "./Design.module.css";

export type BarDatum = {
  label: string;
  value: number;
  description: string;
  highlighted?: boolean;
};

export function BarChart({ data, label }: { data: BarDatum[]; label: string }) {
  const maximum = Math.max(1, ...data.map((item) => item.value));
  return (
    <div
      className={styles.chart}
      role="img"
      aria-label={`${label}: ${data.map((item) => item.description).join("; ")}`}
    >
      {data.map((item, index) => (
        <div
          className={styles.chartColumn}
          key={index}
          data-highlighted={item.highlighted}
          title={item.description}
        >
          <div className={styles.chartTrack}>
            <i
              style={{
                height: `${(Math.max(0, item.value) / maximum) * 100}%`,
              }}
            />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}
