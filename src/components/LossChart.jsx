import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import Plotly from "plotly.js-dist-min";

const LossChart = () => {
  const plotRef = useRef(null);
  const [steps, setSteps] = useState([]);
  const [trainLoss, setTrainLoss] = useState([]);
  const [valLoss, setValLoss] = useState([]);
  const [animationMode, setAnimationMode] = useState("static");

  const loadCSV = async (path, setStepFn, setLossFn) => {
    const res = await fetch(path);
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

        const stepCol = rows.map((row) => row[Object.keys(row)[0]]);
        const lossCol = rows.map((row) => row[Object.keys(row)[1]]);

        if (setStepFn) setStepFn(stepCol);
        setLossFn(lossCol);
      },
    });
  };

  useEffect(() => {
    loadCSV("/data/train_loss.csv", setSteps, setTrainLoss);
    loadCSV("/data/val_loss.csv", null, setValLoss);
  }, []);

  useEffect(() => {
    if (!steps.length || !trainLoss.length || !valLoss.length) return;

    const layout = {
      title: "Train vs Validation Loss",
      xaxis: {
        title: { text: "Step" },
        range: [Math.min(...steps), Math.max(...steps)],
      },
      yaxis: {
        title: { text: "Loss" },
        range: [
          Math.min(...trainLoss.concat(valLoss)) * 0.95,
          Math.max(...trainLoss.concat(valLoss)) * 1.05,
        ],
      },
      width: 800,
      height: 500,
      showlegend: true,
    };

    if (animationMode === "static") {
      const data = [
        {
          x: steps,
          y: trainLoss,
          type: "scatter",
          mode: "lines+markers",
          name: "Train Loss",
          line: { color: "steelblue", width: 1.5},
          marker: { size: 3 },
        },
        {
          x: steps,
          y: valLoss,
          type: "scatter",
          mode: "lines+markers",
          name: "Val Loss",
          line: { color: "green", width: 1.5},
          marker: { size: 3 },
        },
      ];
      Plotly.newPlot(plotRef.current, data, layout);
    } else {
      const frames = steps.map((_, i) => ({
        name: `f${i}`,
        data: [
          {
            x: steps.slice(0, i + 1),
            y: trainLoss.slice(0, i + 1),
          },
          {
            x: steps.slice(0, i + 1),
            y: valLoss.slice(0, i + 1),
          },
        ],
      }));

      const data = [
        {
          x: [],
          y: [],
          type: "scatter",
          mode: "lines+markers",
          name: "Train Loss",
          line: { color: "steelblue" , width: 1.5 },
          marker: { size: 3 },
        },
        {
          x: [],
          y: [],
          type: "scatter",
          mode: "lines+markers",
          name: "Val Loss",
          line: { color: "green" , width: 1.5 },
          marker: { size: 3},
        },
      ];

      Plotly.newPlot(plotRef.current, data, layout).then(() => {
        Plotly.animate(plotRef.current, frames, {
          frame: { duration: 100, redraw: true },
          transition: { duration: 1000},
        });
      });
    }
  }, [animationMode, steps, trainLoss, valLoss]);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            name="mode"
            value="static"
            checked={animationMode === "static"}
            onChange={() => setAnimationMode("static")}
          />
          Static
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="animated"
            checked={animationMode === "animated"}
            onChange={() => setAnimationMode("animated")}
          />
          Animated
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div ref={plotRef}></div>
      </div>
    </div>
  );
};

export default LossChart;
