/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ClienteTemp } from '../types';
import { formatToBRLDate } from '../utils';

interface DashboardChartProps {
  clientes: ClienteTemp[];
  theme: 'light' | 'dark';
}

export function DashboardChart({ clientes, theme }: DashboardChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const isDark = theme === 'dark';

  // Dynamic theme aware styling color tokens
  const gridStroke = isDark ? '#18181b' : '#f1f5f9'; // Zinc 900 vs Slate 100
  const axisStroke = isDark ? '#27272a' : '#cbd5e1'; // Zinc 800 vs Slate 300
  const textFill = isDark ? '#71717a' : '#475569'; // Zinc 500 vs Slate 600
  const labelFill = isDark ? '#52525b' : '#64748b'; // Zinc 600 vs Slate 500

  // Parse and compute accumulated registrations over time
  const chartData = useMemo(() => {
    if (clientes.length === 0) return [];

    // Get dates and parse to simple date string YYYY-MM-DD
    const dateCounts: Record<string, number> = {};
    clientes.forEach(c => {
      if (c.created_at) {
        const dateKey = c.created_at.substring(0, 10);
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    });

    // Sort uniquely found dates ascendingly
    const sortedDates = Object.keys(dateCounts).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Calculate cumulative sum
    let cumulative = 0;
    const computedPoints = sortedDates.map(date => {
      cumulative += dateCounts[date];
      return {
        date,
        count: cumulative,
        rawDate: new Date(date)
      };
    });

    // If there is only 1 date, pad it to look like a chart line
    if (computedPoints.length === 1) {
      const single = computedPoints[0];
      const prevDate = new Date(single.rawDate);
      prevDate.setDate(prevDate.getDate() - 2);
      const prevStr = prevDate.toISOString().substring(0, 10);
      return [
        { date: prevStr, count: 0, rawDate: prevDate },
        single
      ];
    }

    return computedPoints;
  }, [clientes]);

  // Dimensioning constants
  const padding = 40;
  const chartWidth = 550;
  const chartHeight = 220;

  // Compute SVG plotting coords
  const svgPoints = useMemo(() => {
    if (chartData.length < 2) return [];

    const minX = 0;
    const maxX = chartData.length - 1;
    const maxCount = Math.max(...chartData.map(d => d.count), 5); // Default ceiling is at least 5

    return chartData.map((d, index) => {
      // Linear scaling ratios
      const x = padding + (index / maxX) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (d.count / maxCount) * (chartHeight - padding * 2);
      return {
        x,
        y,
        date: d.date,
        count: d.count
      };
    });
  }, [chartData]);

  // Generate SVG path for the area fill
  const areaPath = useMemo(() => {
    if (svgPoints.length < 2) return '';
    let d = `M ${svgPoints[0].x} ${chartHeight - padding}`; // Start at bottom-left of chart
    svgPoints.forEach(p => {
      d += ` L ${p.x} ${p.y}`;
    });
    d += ` L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - padding} Z`; // Close path to bottom-right
    return d;
  }, [svgPoints]);

  // Generate SVG path for the stroke line
  const linePath = useMemo(() => {
    if (svgPoints.length < 2) return '';
    let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      d += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
    }
    return d;
  }, [svgPoints]);

  if (clientes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-48 rounded-xl border p-6 text-center ${isDark ? 'border-zinc-900 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>
        <svg className={`h-10 w-10 mb-2 ${isDark ? 'text-zinc-800' : 'text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
        <span className="text-sm font-medium">Sem dados para exibir o gráfico</span>
        <span className="text-xs text-zinc-500 mt-1">Cadastre clientes para gerar o histórico acumulado no tempo</span>
      </div>
    );
  }

  const maxVal = Math.max(...chartData.map(d => d.count), 5);

  return (
    <div className="w-full">
      <div className="relative overflow-visible" id="chart-container">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={chartWidth - padding} 
            y2={padding} 
            stroke={gridStroke} 
            strokeDasharray="4 4" 
          />
          <line 
            x1={padding} 
            y1={(chartHeight) / 2} 
            x2={chartWidth - padding} 
            y2={(chartHeight) / 2} 
            stroke={gridStroke} 
            strokeDasharray="4 4" 
          />
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding} 
            stroke={axisStroke} 
            strokeWidth={1.5}
          />

          {/* Left Y Axis Label */}
          <text 
            x={padding - 10} 
            y={padding + 5} 
            fill={textFill} 
            fontSize="10" 
            fontFamily="monospace" 
            textAnchor="end"
          >
            {maxVal}
          </text>
          <text 
            x={padding - 10} 
            y={(chartHeight) / 2 + 3} 
            fill={textFill} 
            fontSize="10" 
            fontFamily="monospace" 
            textAnchor="end"
          >
            {Math.floor(maxVal / 2)}
          </text>
          <text 
            x={padding - 10} 
            y={chartHeight - padding + 3} 
            fill={textFill} 
            fontSize="10" 
            fontFamily="monospace" 
            textAnchor="end"
          >
            0
          </text>

          {/* Area under the line */}
          {areaPath && (
            <path 
              d={areaPath} 
              fill="url(#chartGradient)" 
            />
          )}

          {/* Main Line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Axis labels & interactive hover points */}
          {svgPoints.map((p, idx) => {
            // Only draw helper lines and text selectively if too many items
            const showLabel = 
              svgPoints.length <= 6 || 
              idx === 0 || 
              idx === svgPoints.length - 1 || 
              (idx % Math.floor(svgPoints.length / 4) === 0);

            return (
              <g key={idx}>
                {/* Visual Label X Axis */}
                {showLabel && (
                  <text
                    x={p.x}
                    y={chartHeight - padding + 15}
                    fill={labelFill}
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {formatToBRLDate(p.date).substring(0, 5)}
                  </text>
                )}

                {/* Grid vertical line helper on hover */}
                {hoveredPoint?.date === p.date && (
                  <line 
                    x1={p.x} 
                    y1={padding} 
                    x2={p.x} 
                    y2={chartHeight - padding} 
                    stroke="#3b82f6" 
                    strokeWidth={1} 
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point dot circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.date === p.date ? 6 : 3.5}
                  fill={hoveredPoint?.date === p.date ? '#2563eb' : '#1d4ed8'}
                  stroke="#3b82f6"
                  strokeWidth={hoveredPoint?.date === p.date ? 2 : 0}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredPoint({
                      date: p.date,
                      count: p.count,
                      x: p.x,
                      y: p.y
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div 
            className={`absolute z-10 pointer-events-none rounded-lg border p-2 text-xs shadow-xl transition-all duration-150 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80' : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200'}`}
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: `${(hoveredPoint.y / chartHeight) * 100 - 30}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold text-blue-500">
              {hoveredPoint.count} {hoveredPoint.count === 1 ? 'Cliente' : 'Clientes'}
            </div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Acumulado em {formatToBRLDate(hoveredPoint.date)}
            </div>
          </div>
        )}
      </div>
      <div className={`flex justify-between text-[11px] px-4 mt-2 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        <span>Início do Período</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span> 
          Adesão Acumulada no Tempo
        </span>
        <span>Último Cadastro</span>
      </div>
    </div>
  );
}
