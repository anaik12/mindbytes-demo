import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const SurfaceLWRMSEChart = () => {
  const [selected, setSelected] = useState("2m_train_temp");
  const [datasets, setDatasets] = useState({});

  const files = {
    "2m_train_temp": "/data/2m_train_temp.csv",
    "10m_u_train_wind": "/data/10m_u_train_wind.csv",
    "2m_val_temp": "/data/2m_val_temp.csv",
    "10m_u_val_wind": "/data/10m_u_val_wind.csv",
  };

  const colors = {
    "2m_train_temp": "steelblue",
    "10m_u_train_wind": "steelblue",
    "2m_val_temp": "green",
    "10m_u_val_wind": "green",
  };

  // Load CSV files
  useEffect(() => {
    const loadCSV = async () => {
      const loaded = {};

      for (const [key, path] of Object.entries(files)) {
        const response = await fetch(path);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const stepCol = results.data.map((row) => row.Step);
            const valueCol = results.data.map((row) =>
              row[Object.keys(row)[1]]
            );

            loaded[key] = {
              x: stepCol,
              y: valueCol,
              color: colors[key],
              size: 1.5,
            };

            // Only update state when all are loaded
            if (Object.keys(loaded).length === Object.keys(files).length) {
              setDatasets(loaded);
            }
          },
        });
      }
    };

    loadCSV();
  }, []);

  if (!datasets[selected]) return <div>Loading data...</div>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {Object.keys(files).map((key) => (
          <label key={key} style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              name="dataset"
              value={key}
              checked={selected === key}
              onChange={() => setSelected(key)}
            />
            {key}
          </label>
        ))}
      </div>

      <Plot
        data={[
          {
            x: datasets[selected].x,
            y: datasets[selected].y,
            type: "scatter",
            mode: "lines+markers",
            marker: { color: datasets[selected].color, size:3},
            name: selected,
          },
        ]}
        layout={{
          width: 800,
          height: 500,
          title: `LWRMSE Plot: ${selected}`,
          xaxis: { title: { text: "Step" } },
          yaxis: { title: { text: "LWRMSE (Lat. Weight. RMSE)" } },
        }}
      />
    </div>
  );
};

export default SurfaceLWRMSEChart;
