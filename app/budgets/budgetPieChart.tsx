'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
}

interface BudgetPieChartProps {
  budgets: BudgetCategory[];
}

const CHART_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#64748b', // Slate
];

export default function BudgetPieChart({ budgets }: BudgetPieChartProps) {
  // Filter out zero/negative values for the pie visualization
  const chartData = budgets
    .filter((b) => b.limit > 0)
    .map((b) => ({
      name: b.category,
      value: b.limit,
    }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-200">Allocation Breakdown</h2>
        <p className="text-xs text-slate-500">
          Visual distribution of allocated funds across active categories.
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${Number(value || 0).toFixed(2)}`, 'Allocated']}
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs text-slate-400 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-sm text-slate-600 border border-dashed border-slate-800 rounded-lg">
          No active budget allocations to display.
        </div>
      )}
    </div>
  );
}