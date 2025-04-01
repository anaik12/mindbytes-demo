// App.js
import './App.css';
import LossChart from './components/LossChart';
import GpuMetricsChart from './components/GpuMetricsChart';
import SurfaceLWRMSEChart from './components/SurfaceLWRMSEChart';
import AtmosphericLWRMSEChart from './components/AtmosphericLWRMSEChart';
import TestCsvLoader from './components/TestCsvLoader';

function App() {
  return (
    <div className="App">
      <h1>ALCF-UChicago Lighthouse Initiative: Climate AI Models</h1>
      {/* <TestCsvLoader /> */}

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Training and Validation Loss</h2>
          <LossChart />
        </div>
        <div style={{ flex: 1 }}>
          <h2>GPU System Metrics - Utilization and Memory Allocation</h2>
          <GpuMetricsChart />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>LWRMSE - Surface Variables (Temp & Wind)</h2>
          <SurfaceLWRMSEChart />
        </div>
        <div style={{ flex: 1 }}>
          <h2>LWRMSE - Atmospheric Variables (Humidity & Geopotential)</h2>
          <AtmosphericLWRMSEChart />
        </div>
      </div>
    </div>
  );
}

export default App;
