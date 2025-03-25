// App.js
import './App.css';
import LossChart from './components/LossChart';
import GpuMetricsChart from './components/GpuMetricsChart';
 import SurfaceLWRMSEChart from './components/SurfaceLWRMSEChart';

function App() {
  return (
    <div className="App">
      <h1>Mindbytes Demo</h1>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>Loss Chart</h2>
          <LossChart />
        </div>
        <div style={{ flex: 1 }}>
          <h2>GPU System Metrics</h2>
          <GpuMetricsChart />
        </div>
        <div style={{ flex: 1 }}>
          <h2>LWRMSE - Surface Variables (Temp & Wind)</h2>
          <SurfaceLWRMSEChart />
        </div>
      </div>
    </div>
  );
}

export default App;
