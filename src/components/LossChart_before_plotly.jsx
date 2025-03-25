// Linechart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import valData from '../data/val_loss.csv';
import trainData from '../data/train_loss.csv';

const LossChart = () => {
  const ref = useRef();

  useEffect(() => {
    Promise.all([
      d3.csv(valData, d => ({
        step: +d.Step,
        val_loss: +d['base_config_0118 - val_loss']
      })),
      d3.csv(trainData, d => ({
        step: +d.Step,
        train_loss: +d['base_config_0118 - train_loss']
      }))
    ]).then(([valLossRaw, trainLossRaw]) => {
      const dataMap = new Map();
      valLossRaw.forEach(d => dataMap.set(d.step, { step: d.step, val_loss: d.val_loss }));
      trainLossRaw.forEach(d => {
        if (dataMap.has(d.step)) {
          dataMap.get(d.step).train_loss = d.train_loss;
        } else {
          dataMap.set(d.step, { step: d.step, train_loss: d.train_loss });
        }
      });
      const data = Array.from(dataMap.values()).sort((a, b) => a.step - b.step);

      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();

      const width = 800;
      const height = 450;
      const margin = { top: 20, right: 80, bottom: 60, left: 60 };

      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.step))
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.val_loss || 0, d.train_loss || 0))])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', (width - margin.left - margin.right) / 2 + margin.left)
        .attr('y', 40)
        .attr('fill', 'black')
        .text('Step');

      const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .text('Loss');

      const valLine = d3.line()
        .x(d => x(d.step))
        .y(d => y(d.val_loss));

      const trainLine = d3.line()
        .x(d => x(d.step))
        .y(d => y(d.train_loss));

      svg
        .attr('width', width)
        .attr('height', height);

      svg.append('g').call(xAxis);
      svg.append('g').call(yAxis);

      svg.append('path')
        .datum(data.filter(d => d.val_loss != null))
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', valLine);

      svg.append('path')
        .datum(data.filter(d => d.train_loss != null))
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 2)
        .attr('d', trainLine);

      // Legend
      svg.append('circle').attr('cx', width - 120).attr('cy', 30).attr('r', 6).style('fill', 'steelblue');
      svg.append('text').attr('x', width - 105).attr('y', 35).text('Val Loss').style('font-size', '12px').attr('alignment-baseline', 'middle');
      svg.append('circle').attr('cx', width - 120).attr('cy', 50).attr('r', 6).style('fill', 'orange');
      svg.append('text').attr('x', width - 105).attr('y', 55).text('Train Loss').style('font-size', '12px').attr('alignment-baseline', 'middle');

      // Tooltip & hover line
      const tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('padding', '6px 10px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('font-size', '14px');

      const focusLine = svg.append('line')
        .style('stroke', '#aaa')
        .style('stroke-dasharray', '4')
        .style('stroke-width', 1)
        .style('opacity', 0)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom);

      const overlay = svg.append('rect')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left},${margin.top})`);

      overlay.on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const hoveredStep = Math.round(x.invert(mx + margin.left));
        const d = data.find(pt => pt.step === hoveredStep);
        if (!d) return;

        focusLine
          .attr('x1', x(d.step))
          .attr('x2', x(d.step))
          .style('opacity', 1);

        tooltip
          .html(`
            <strong>Step:</strong> ${d.step}<br/>
            <strong>Val Loss:</strong> ${d.val_loss?.toFixed(4)}<br/>
            <strong>Train Loss:</strong> ${d.train_loss?.toFixed(4)}
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`)
          .style('opacity', 1);
      });

      overlay.on('mouseleave', () => {
        tooltip.style('opacity', 0);
        focusLine.style('opacity', 0);
      });
    });
  }, []);

  return <svg ref={ref}></svg>;
};

export default LossChart;
