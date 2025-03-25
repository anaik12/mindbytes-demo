// GpuMetricsChart.js
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gpuUtilPath from '../data/gpu_util_percent.csv';
import gpuMemPercentPath from '../data/gpu_mem_alloc_percent.csv';
import gpuMemBytesPath from '../data/gpu_mem_alloc_bytes.csv';

const GpuMetricsChart = () => {
  const ref = useRef();
  const [metric, setMetric] = useState('percent');

  useEffect(() => {
    const loaders = {
      percent: () => d3.csv(gpuMemPercentPath, d => ({
        time: +d['Relative Time (Process)'],
        value: ( +d['base_config_0118 - system/gpu.0.memoryAllocated'] +
                 +d['base_config_0118 - system/gpu.1.memoryAllocated'] +
                 +d['base_config_0118 - system/gpu.2.memoryAllocated'] +
                 +d['base_config_0118 - system/gpu.3.memoryAllocated']) / 4
      })),
      bytes: () => d3.csv(gpuMemBytesPath, d => ({
        time: +d['Relative Time (Process)'],
        value: ( +d['base_config_0118 - system/gpu.0.memoryAllocatedBytes'] +
                 +d['base_config_0118 - system/gpu.1.memoryAllocatedBytes'] +
                 +d['base_config_0118 - system/gpu.2.memoryAllocatedBytes'] +
                 +d['base_config_0118 - system/gpu.3.memoryAllocatedBytes']) / 4
      })),
      util: () => d3.csv(gpuUtilPath, d => ({
        time: +d['Relative Time (Process)'],
        value: +d['base_config_0118 - system/gpu.process.0.gpu']
      }))
    };

    loaders[metric]().then(data => {
      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();

      const width = 800;
      const height = 450;
      const margin = { top: 20, right: 60, bottom: 50, left: 60 };

      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.time))
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on('zoom', zoomed);

      const line = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.value));

      svg.attr('width', width).attr('height', height);

      const gX = svg.append('g').call(xAxis);
      const gY = svg.append('g').call(yAxis);

      const color = metric === 'bytes' ? '#2196f3' : metric === 'percent' ? '#ff9800' : '#9c27b0';

      const path = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('padding', '6px 10px')
        .style('background', 'white')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('opacity', 0);

      const focusLine = svg.append('line')
        .style('stroke', '#aaa')
        .style('stroke-dasharray', '4')
        .style('stroke-width', 1)
        .style('opacity', 0)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom);

      svg.append('rect')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .on('mousemove', function (event) {
          const [mx] = d3.pointer(event);
          const hoveredTime = x.invert(mx + margin.left);
          const bisect = d3.bisector(d => d.time).left;
          const i = bisect(data, hoveredTime);
          const d = data[i];
          if (!d) return;

          focusLine
            .attr('x1', x(d.time))
            .attr('x2', x(d.time))
            .style('opacity', 1);

          tooltip.html(
            `<strong>Time:</strong> ${d.time.toFixed(2)}<br/><strong>Value:</strong> ${d.value.toFixed(2)}`
          )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 30}px`)
            .style('opacity', 1);
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', 0);
          focusLine.style('opacity', 0);
        });

      function zoomed(event) {
        const zx = event.transform.rescaleX(x);
        const zy = event.transform.rescaleY(y);

        gX.call(d3.axisBottom(zx));
        gY.call(d3.axisLeft(zy));

        path.attr('d', d3.line()
          .x(d => zx(d.time))
          .y(d => zy(d.value)));

        focusLine.attr('y1', zy.range()[1]).attr('y2', zy.range()[0]);
      }

      svg.call(zoom);
    });
  }, [metric]);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label><input type="radio" value="percent" checked={metric === 'percent'} onChange={() => setMetric('percent')} /> GPU Mem (%)</label>
        {' '}
        <label><input type="radio" value="bytes" checked={metric === 'bytes'} onChange={() => setMetric('bytes')} /> GPU Mem (Bytes)</label>
        {' '}
        <label><input type="radio" value="util" checked={metric === 'util'} onChange={() => setMetric('util')} /> GPU Util (%)</label>
      </div>
      <svg ref={ref}></svg>
    </div>
  );
};

export default GpuMetricsChart;
