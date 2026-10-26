"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";
const Apex = dynamic(() => import("react-apexcharts"), { ssr: false });
export function metric(value: number | null | undefined, unit = "") {
  if (value == null) return "Not recorded";
  return (
    (unit === "USD"
      ? "$" + value.toFixed(6)
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 })) +
    (unit && unit !== "USD" ? " " + unit : "")
  );
}
export function Chart({
  title,
  values,
  dates,
  unit = "",
  variant = "line",
  showDataLabels = true,
}: {
  title: string;
  values: (number | null)[];
  dates: string[];
  unit?: string;
  variant?: "line" | "bar";
  showDataLabels?: boolean;
}) {
  const { theme } = useTheme();
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
      foreColor: theme === "dark" ? "#98a2b3" : "#667085",
    },
    colors: ["#465fff"],
    theme: { mode: theme === "dark" ? "dark" : "light" },
    dataLabels: {
      enabled: showDataLabels,
      background: { enabled: true },
      formatter: (value) => (value == null ? "" : metric(Number(value), unit)),
    },
    stroke: { width: variant === "line" ? 2 : 0, curve: "straight" },
    markers: { size: variant === "line" ? 4 : 0 },
    xaxis: {
      categories: dates,
      labels: { rotate: -45, hideOverlappingLabels: false },
    },
    yaxis: { labels: { formatter: (value) => metric(value, unit) } },
    tooltip: { y: { formatter: (value) => metric(value, unit) } },
    grid: { padding: { top: 25, right: 30, left: 20 } },
    plotOptions: {
      bar: { dataLabels: { position: "top" }, columnWidth: "50%" },
    },
    noData: { text: "No recorded data" },
  };
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
      <h3 className="mb-3 text-sm font-medium text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <div className="custom-scrollbar overflow-x-auto">
        <div style={{ minWidth: Math.max(540, values.length * 90) }}>
          <Apex
            type={variant}
            options={options}
            series={[{ name: title, data: values }]}
            height={300}
          />
        </div>
      </div>
    </section>
  );
}
