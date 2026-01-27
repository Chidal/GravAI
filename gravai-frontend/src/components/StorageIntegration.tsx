"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const StorageIntegration: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [rootHash, setRootHash] = useState<string>('');

  const uploadFile = async (filePath: string) => {
    try {
      setStatus('Uploading...');
      const response = await fetch('http://localhost:3001/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      const { rootHash, txHash } = await response.json();
      setRootHash(rootHash);
      setStatus(`Upload successful! Tx: ${txHash}`);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const downloadFile = async (rootHash: string, outputPath: string) => {
    try {
      setStatus('Downloading...');
      const response = await fetch('http://localhost:3001/api/storage/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootHash, outputPath }),
      });
      await response.json();
      setStatus('Download successful!');
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <h2 className="text-2xl font-bold text-white text-shadow-glow">0G Storage Integration</h2>
      <div className="bg-gray-900/50 p-4 rounded-lg">
        <p className="text-gray-200 mb-4">Status: {status}</p>
        <div className="space-y-2">
          <button
            onClick={() => uploadFile('example-file.txt')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Upload File
          </button>
          <button
            onClick={() => downloadFile(rootHash, 'downloaded-file.txt')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Download File
          </button>
        </div>
        {rootHash && <p className="text-sm text-gray-400 mt-2">Root Hash: {rootHash}</p>}
      </div>
    </motion.div>
  );
};

export default StorageIntegration;