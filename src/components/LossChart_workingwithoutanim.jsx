import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const LossChart = () => {
  const [trainLoss, setTrainLoss] = useState([]);
  const [valLoss, setValLoss] = useState([]);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const loadCSV = async (path, setter) => {
      const res = await fetch(path);
      const text = await res.text();
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const values = result.data.map((row) =>
            parseFloat(row[Object.keys(row)[1]])
          );
          setter(values);

          // Set steps only once
          if (steps.length === 0) {
            const stepValues = result.data.map((row) => row.Step);
            setSteps(stepValues);
          }
        },
      });
    };

    loadCSV("/data/train_loss.csv", setTrainLoss);
    loadCSV("/data/val_loss.csv", setValLoss);
  }, []);

  return (
    <div>
      <h2>Train vs Validation Loss</h2>
      <Plot
        data={[
          {
            x: steps,
            y: trainLoss,
            type: "scatter",
            mode: "lines+markers",
            name: "Train Loss",
            line: { color: "steelblue" },
          },
          {
            x: steps,
            y: valLoss,
            type: "scatter",
            mode: "lines+markers",
            name: "Validation Loss",
            line: { color: "green" },
          },
        ]}
        layout={{
          title: "Loss Over Steps",
          xaxis: { title: { text: "Step" } },
          yaxis: { title: { text: "Loss" } },
          width: 800,
          height: 500,
        }}
      />
    </div>
  );
};

export default LossChart;
