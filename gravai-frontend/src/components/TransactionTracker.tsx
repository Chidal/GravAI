"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Transaction } from '../types';
import { Chart, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Scale,
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

// Register all required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  MatrixController,
  MatrixElement
);

// Framer Motion variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const TransactionTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('');

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      try {
        const newTransaction: Transaction = JSON.parse(event.data);
        setTransactions((prev) => [newTransaction, ...prev].slice(0, 50));
      } catch (error) {
        console.error('WebSocket parsing error:', error);
      }
    };
    ws.onerror = () => console.error('WebSocket error');
    return () => ws.close();
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!filter.trim()) return transactions;
    const q = filter.toLowerCase();
    return transactions.filter((tx) => {
      const token = (tx.token || 'MATIC').toLowerCase();
      const from = tx.from?.toLowerCase() || '';
      const to = tx.to?.toLowerCase() || '';
      const hash = tx.hash.toLowerCase();
      return token.includes(q) || from.includes(q) || to.includes(q) || hash.includes(q);
    });
  }, [transactions, filter]);

  // Token Distribution (Pie Chart)
  const tokenDistribution = transactions.reduce((acc, tx) => {
    const token = tx.token || 'MATIC';
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(tokenDistribution),
    datasets: [{
      data: Object.values(tokenDistribution),
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(236, 72, 153, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(251, 191, 36, 0.6)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Hourly Value Heatmap (Matrix Chart)
  const hourlyValue = transactions.reduce((acc, tx) => {
    const hour = new Date(Number(tx.timestamp) * 1000).getHours();
    const value = parseFloat(tx.value || '0');
    acc[hour] = (acc[hour] || 0) + value;
    return acc;
  }, {} as Record<number, number>);

  const maxValue = Math.max(...Object.values(hourlyValue), 1);

  const matrixData = {
    datasets: [{
      label: 'Hourly Value',
      data: Array.from({ length: 24 }, (_, h) => ({
        x: h,
        y: 0,
        v: hourlyValue[h] || 0,
      })),
      backgroundColor(c: any) {
        const value = (c.raw as any)?.v || 0;
        const alpha = value === 0 ? 0.1 : value / maxValue;
        return `rgba(59, 130, 246, ${alpha})`;
      },
      borderWidth: 2,
      borderColor: 'rgba(59, 130, 246, 0.3)',
      width: (ctx: any) => (ctx.chart.chartArea?.width || 600) / 24 - 4,
      height: 50,
    }],
  };

  // Fixed: No broken `satisfies` — matrix plugin has no official defaults type
  const matrixOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const v = context.raw?.v || 0;
            return `Hour ${context.raw.x}:00 → ${v.toFixed(6)} ETH`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: 23,
        ticks: {
          stepSize: 1,
          color: '#E5E7EB',
          callback: function (this: Scale, value: number | string) {
            return typeof value === 'number' ? `${value}:00` : value;
          },
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: { display: false },
    },
  } as const;

  // Line Chart - Transaction Value Trend
  const lineChartData = {
    labels: filteredTransactions.map(tx =>
      new Date(Number(tx.timestamp) * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    ),
    datasets: [{
      label: 'Transaction Value (ETH)',
      data: filteredTransactions.map(tx => parseFloat(tx.value || '0')),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#E5E7EB' } },
    },
    scales: {
      x: { ticks: { color: '#E5E7EB' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#E5E7EB' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={fadeIn}>
      <h2 className="text-3xl font-bold text-white text-shadow-glow">Transaction Tracker</h2>

      <input
        type="text"
        placeholder="Search by token, address, or hash..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 rounded-lg bg-gray-800/70 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Token Distribution Pie */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">Token Distribution</h3>
          <div className="h-80">
            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { labels: { color: '#E5E7EB' } } } }} />
          </div>
        </div>

        {/* Hourly Value Heatmap */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">Value Heatmap (by hour)</h3>
          <div className="h-80">
            <Chart type="matrix" data={matrixData} options={matrixOptions} />
          </div>
        </div>
      </div>

      {/* Transaction Value Trend */}
      <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-pink-500/20">
        <h3 className="text-xl font-semibold text-white mb-4">Transaction Value Trend</h3>
        <div className="h-96">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-200">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="py-3 px-4">Hash</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No transactions yet...
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.hash} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 font-mono text-sm">{tx.hash.slice(0, 10)}...</td>
                    <td className="py-3 px-4 font-mono text-sm">{tx.from.slice(0, 8)}...</td>
                    <td className="py-3 px-4 font-mono text-sm">{tx.to?.slice(0, 8) || '—'}...</td>
                    <td className="py-3 px-4">{parseFloat(tx.value || '0').toFixed(6)}</td>
                    <td className="py-3 px-4 font-semibold text-pink-400">{tx.token || 'MATIC'}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionTracker;