import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import Plotly from "plotly.js-dist-min";

const GpuMetricsChart = () => {
  const plotRef = useRef(null);
  const [time, setTime] = useState([]);
  const [metrics, setMetrics] = useState({
    util: [],
    memPercent: [],
    memBytes: [],
  });
  const [selectedMetric, setSelectedMetric] = useState("memBytes");
  const [animationMode, setAnimationMode] = useState("static");

  const labelMap = {
    util: "GPU Utilization (%)",
    memPercent: "Memory Allocation (%)",
    memBytes: "Memory Allocation (Bytes)",
  };

  const colorMap = {
    util: "orange",
    memPercent: "green",
    memBytes: "steelblue",
  };

  useEffect(() => {
    const basePath = process.env.PUBLIC_URL || "";
    const files = {
      util: `${basePath}/data/gpu_util_percent.csv`,
      memPercent: `${basePath}/data/gpu_mem_alloc_percent.csv`,
      memBytes: `${basePath}/data/gpu_mem_alloc_bytes.csv`,
    };

    const loadCSV = async (key, path) => {
      try {
        console.log(`📦 Fetching ${key} from ${path}`);
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data.filter(
              (row) =>
                typeof row[Object.keys(row)[0]] === "number" &&
                typeof row[Object.keys(row)[1]] === "number"
            );

            const timeCol = rows.map((row) => row[Object.keys(row)[0]]);
            const valueCol = rows.map((row) => row[Object.keys(row)[1]]);

            setMetrics((prev) => ({ ...prev, [key]: valueCol }));
            if (!time.length) setTime(timeCol);
          },
        });
      } catch (err) {
        console.error(`Failed to fetch ${key}:`, err);
      }
    };

    Object.entries(files).forEach(([key, path]) => {
      loadCSV(key, path);
    });
  }, [time.length]);

  useEffect(() => {
    if (!metrics[selectedMetric].length || !time.length) return;

    const yValues = metrics[selectedMetric];
    const color = colorMap[selectedMetric];
    const label = labelMap[selectedMetric];

    const layout = {
      title: `GPU Metric: ${label}`,
      xaxis: {
        title: { text: "Relative Time (s)" },
        range: [Math.min(...time), Math.max(...time)],
      },
      yaxis: {
        title: { text: label },
        range: [Math.min(...yValues) * 0.95, Math.max(...yValues) * 1.05],
      },
      width: 900,
      height: 500,
      showlegend: false,
    };

    if (animationMode === "static") {
      const trace = {
        x: time,
        y: yValues,
        type: "scatter",
        mode: "lines+markers",
        line: { color, width: 1.5 },
        marker: { size: 4 },
        name: label,
      };
      Plotly.newPlot(plotRef.current, [trace], layout);
    } else {
      const frames = time.map((_, i) => ({
        name: `f${i}`,
        data: [
          {
            x: time.slice(0, i + 1),
            y: yValues.slice(0, i + 1),
          },
        ],
      }));

      const data = [
        {
          x: [],
          y: [],
          type: "scatter",
          mode: "lines+markers",
          name: label,
          line: { color, width: 1.5 },
          marker: { size: 3 },
        },
      ];

      Plotly.newPlot(plotRef.current, data, layout).then(() => {
        Plotly.animate(plotRef.current, frames, {
          frame: { duration: 1, redraw: false },
          transition: { duration: 0 },
        });
      });
    }
  }, [selectedMetric, animationMode, metrics, time]);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Metric:&nbsp;
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {Object.keys(labelMap).map((key) => (
              <option key={key} value={key}>
                {labelMap[key]}
              </option>
            ))}
          </select>
        </label>

        <span style={{ marginLeft: "2rem" }}>
          <label style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              value="static"
              checked={animationMode === "static"}
              onChange={() => setAnimationMode("static")}
            />
            Static
          </label>
          <label>
            <input
              type="radio"
              value="animated"
              checked={animationMode === "animated"}
              onChange={() => setAnimationMode("animated")}
            />
            Animated
          </label>
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div ref={plotRef}></div>
      </div>
    </div>
  );
};

export default GpuMetricsChart;
