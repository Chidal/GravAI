"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Block } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Framer Motion animation
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      try {
        const newBlock: Block = JSON.parse(event.data);
        setBlocks((prev) => [newBlock, ...prev].slice(0, 50));
      } catch (error) {
        console.error("WebSocket parsing error:", error);
      }
    };

    ws.onerror = () => {
      console.error("WebSocket error");
      ws.close();
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => ws.close();
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Calculate block times (in seconds) between consecutive blocks
  // ──────────────────────────────────────────────────────────────
  const timestamps = blocks.map((b) => Number(b.timestamp || 0));

  const blockTimes = timestamps
    .map((ts, i, arr) => (i === 0 ? 0 : ts - arr[i - 1])) // Fixed line
    .slice(-20);

  // Labels: last 20 blocks → formatted time (HH:MM:SS)
  const labels = blocks
    .slice(-20)
    .map((block) =>
      new Date(Number(block.timestamp) * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

  // Gas Usage chart data
  const gasData = {
    labels,
    datasets: [
      {
        label: "Gas Used",
        data: blocks.slice(-20).map((b) => parseFloat(b.gasUsed || "0")),
        borderColor: "rgba(236, 72, 153, 1)",
        backgroundColor: "rgba(236, 72, 153, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Block Time chart data
  const blockTimeData = {
    labels,
    datasets: [
      {
        label: "Block Time (seconds)",
        data: blockTimes,
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#E5E7EB" } },
    },
    scales: {
      x: {
        ticks: { color: "#E5E7EB" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#E5E7EB" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <h2 className="text-3xl font-bold text-white text-shadow-glow">
        Block Explorer
      </h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gas Usage Trend */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-pink-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Gas Usage Trend
          </h3>
          <div className="h-80">
            <Line data={gasData} options={chartOptions} />
          </div>
        </div>

        {/* Block Time */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Block Time (seconds)
          </h3>
          <div className="h-80">
            <Line data={blockTimeData} options={chartOptions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlockExplorer;