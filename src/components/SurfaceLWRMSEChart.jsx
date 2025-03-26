import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import Plotly from "plotly.js-dist-min";

const SurfaceLWRMSEChart = () => {
  const plotRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState("2m_train_temp");
  const [animationMode, setAnimationMode] = useState("static");
  const [datasets, setDatasets] = useState({});

  const basePath = process.env.PUBLIC_URL || "";

  const config = {
    "2m_train_temp": {
      label: "Train_2m_Temp",
      path: `${basePath}/data/2m_train_temp.csv`,
      color: "steelblue",
    },
    "2m_val_temp": {
      label: "Val_2m_temp",
      path: `${basePath}/data/2m_val_temp.csv`,
      color: "green",
    },
    "10m_u_train_wind": {
      label: "Train_10mU_Wind",
      path: `${basePath}/data/10m_u_train_wind.csv`,
      color: "steelblue",
    },
    "10m_u_val_wind": {
      label: "Val_10m_U_Wind",
      path: `${basePath}/data/10m_u_val_wind.csv`,
      color: "green",
    },
  };

  useEffect(() => {
    const loadCSV = async (key, path) => {
      try {
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
            const step = rows.map((r) => r[Object.keys(r)[0]]);
            const value = rows.map((r) => r[Object.keys(r)[1]]);
            setDatasets((prev) => ({
              ...prev,
              [key]: { step, value },
            }));
          },
        });
      } catch (err) {
        console.error(`Failed to load ${key}:`, err);
      }
    };

    Object.entries(config).forEach(([key, { path }]) =>
      loadCSV(key, path)
    );
  }, []);

  const selectedData = datasets[selectedKey];

  useEffect(() => {
    if (
      !selectedData ||
      !selectedData.step?.length ||
      !selectedData.value?.length
    )
      return;

    const { step, value } = selectedData;
    const { label, color } = config[selectedKey];

    const layout = {
      title: `LWRMSE – ${label}`,
      xaxis: {
        title: { text: "Step" },
        range: [Math.min(...step), Math.max(...step)],
      },
      yaxis: {
        title: { text: "LWRMSE (Lat. Weight. RMSE)" },
        range: [
          Math.min(...value) * 0.95,
          Math.max(...value) * 1.05,
        ],
      },
      width: 800,
      height: 500,
      showlegend: false,
    };

    if (animationMode === "static") {
      const trace = {
        x: step,
        y: value,
        type: "scatter",
        mode: "lines+markers",
        name: label,
        line: { color, width: 1.5 },
        marker: { size: 4 },
      };
      Plotly.newPlot(plotRef.current, [trace], layout);
    } else {
      const frames = step.map((_, i) => ({
        name: `f${i}`,
        data: [
          {
            x: step.slice(0, i + 1),
            y: value.slice(0, i + 1),
          },
        ],
      }));

      const trace = {
        x: [],
        y: [],
        type: "scatter",
        mode: "lines+markers",
        name: label,
        line: { color, width: 1.5 },
        marker: { size: 4 },
      };

      Plotly.newPlot(plotRef.current, [trace], layout).then(() => {
        Plotly.animate(plotRef.current, frames, {
          frame: { duration: 5, redraw: true },
          transition: { duration: 100 },
        });
      });
    }
  }, [selectedKey, animationMode, selectedData]);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Dataset:&nbsp;
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {Object.entries(config).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
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

export default SurfaceLWRMSEChart;
