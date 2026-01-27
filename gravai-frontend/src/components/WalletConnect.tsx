"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Install it: https://metamask.io");
      return;
    }

    setConnecting(true);
    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts[0];
      setAccount(addr);

      // Get balance
      const bal = await window.ethereum.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });
      const eth = parseInt(bal, 16) / 1e18;
      setBalance(eth.toFixed(4));
    } catch (err: any) {
      alert("Connection failed: " + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
  };

  // Auto-reconnect if already connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Re-fetch balance
          window.ethereum
            .request({ method: "eth_getBalance", params: [accounts[0], "latest"] })
            .then((bal: string) => {
              setBalance((parseInt(bal, 16) / 1e18).toFixed(4));
            });
        }
      });
    }
  }, []);

  if (account) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/40"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs font-mono text-cyan-300">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <span className="text-xs text-yellow-400 font-bold">{balance} ETH</span>
        <button
          onClick={disconnect}
          className="text-xs text-red-400 hover:text-red-300"
        >
          ×
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={connect}
      disabled={connecting}
      className={`
        relative overflow-hidden rounded-full px-6 py-2 font-bold text-white
        bg-gradient-to-r from-cyan-500 to-purple-600
        shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/50
        disabled:opacity-70 disabled:cursor-not-allowed
        transition-all duration-300
      `}
    >
      <span className="relative z-10">
        {connecting ? "Connecting..." : "Connect Wallet"}
      </span>
      <div className="absolute inset-0 bg-white/20 animate-ping" />
    </motion.button>
  );
}