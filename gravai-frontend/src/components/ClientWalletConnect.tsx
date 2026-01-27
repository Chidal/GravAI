"use client";

import dynamic from 'next/dynamic';

// Dynamically import WalletConnect with SSR disabled
const WalletConnect = dynamic(() => import('./WalletConnect'), { ssr: false });

const ClientWalletConnect: React.FC = () => {
  return <WalletConnect />;
};

export default ClientWalletConnect;