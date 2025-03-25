import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const GpuMetricsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState("util");
  const [metrics, setMetrics] = useState({
    time: [],
    util: [],
    memPercent: [],
    memBytes: [],
  });

  useEffect(() => {
    const loadCSV = async (path, key) => {
      const res = await fetch(path);
      const text = await res.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const rows = result.data;
          const timeCol = rows.map((row) => row[Object.keys(row)[0]]);
          const valueCol = rows.map((row) => parseFloat(row[Object.keys(row)[1]]));

          setMetrics((prev) => ({
            ...prev,
            time: prev.time.length ? prev.time : timeCol,
            [key]: valueCol,
          }));
        },
      });
    };

    loadCSV("/data/gpu_util_percent.csv", "util");
    loadCSV("/data/gpu_mem_alloc_percent.csv", "memPercent");
    loadCSV("/data/gpu_mem_alloc_bytes.csv", "memBytes");
  }, []);

  const metricMap = {
    util: {
      label: "GPU Utilization (%)",
      color: "orange",
      yaxis: "y",
    },
    memPercent: {
      label: "Memory Allocation (%)",
      color: "green",
      yaxis: "y",
    },
    memBytes: {
      label: "Memory Allocation (Bytes)",
      color: "steelblue",
      yaxis: "y2",
    },
  };

  const selected = metricMap[selectedMetric];

  return (
    <div>
      <h2>GPU Metric: {selected.label}</h2>

      <div style={{ marginBottom: "1rem" }}>
        {Object.entries(metricMap).map(([key, { label }]) => (
          <label key={key} style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="gpu-metric"
              value={key}
              checked={selectedMetric === key}
              onChange={() => setSelectedMetric(key)}
            />
            {label}
          </label>
        ))}
      </div>

      <Plot
        data={[
          {
            x: metrics.time,
            y: metrics[selectedMetric],
            type: "scatter",
            mode: "lines",
            name: selected.label,
            line: { color: selected.color, width: 1.5 },
            marker: {size: 3},
            yaxis: selected.yaxis,
          },
        ]}
        layout={{
          title: `GPU ${selected.label} Over Time`,
          width: 900,
          height: 500,
          xaxis: { title: { text: "Relative Time (s)" } },
          yaxis: {
            title: {
              text:
                selectedMetric === "memBytes"
                  ? ""
                  : selectedMetric === "memPercent"
                  ? "Memory Alloc (%)"
                  : "Utilization (%)",
            },
            side: "left",
            showgrid: true,
            visible: selectedMetric !== "memBytes",
          },
          yaxis2: {
            title: { text: selectedMetric === "memBytes" ? "Memory Alloc (Bytes)" : "" },
            side: "right",
            overlaying: "y",
            showgrid: false,
            visible: selectedMetric === "memBytes",
          },
          showlegend: false,
        }}
      />
    </div>
  );
};

export default GpuMetricsChart;
