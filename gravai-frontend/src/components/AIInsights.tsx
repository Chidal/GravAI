// src/components/AIInsights.tsx

"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";           // ← import Variants
import { Transaction } from "@/types";
import { Switch } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/solid";

// Correctly typed variants – this is the only thing that was breaking the build
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,        // ← this satisfies the strict Easing type
    },
  },
};

interface AIInsightsProps {
  transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions }) => {
  const [anomalyAlerts, setAnomalyAlerts] = useState(false);

  const walletActivity = transactions.reduce((acc, tx) => {
    const value = parseFloat(tx.value || "0");
    acc[tx.from] = (acc[tx.from] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      className="space-y-4 h-full flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeIn}           // ← now perfectly typed
    >
      <h2 className="text-2xl font-bold text-white text-shadow-glow">
        AI Insights
      </h2>

      <div className="bg-gray-900/50 p-4 rounded-lg flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white text-shadow-glow flex items-center">
            <BellIcon className="h-5 w-5 mr-2" />
            Anomaly Alerts
          </h3>

          <Switch
            checked={anomalyAlerts}
            onChange={setAnomalyAlerts}
            className={`${
              anomalyAlerts ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                anomalyAlerts ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        <div className="flex-1">
          <h4 className="text-md font-medium text-gray-300 mb-3">
            Top Active Wallets
          </h4>

          <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {Object.entries(walletActivity)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([wallet, total]) => (
                <div
                  key={wallet}
                  className="flex justify-between py-1.5 border-b border-gray-700/50"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {wallet.slice(0, 8)}...
                  </span>
                  <span className="text-white font-medium">
                    {(total / 1e18).toFixed(4)} ETH
                  </span>
                </div>
              ))}

            {Object.keys(walletActivity).length === 0 && (
              <p className="text-gray-500 text-sm">Waiting for transactions...</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsights;