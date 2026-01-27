"use client"; // Mark as Client Component since it uses React Query

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a QueryClient instance
const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet], // Replace with 0G testnet chain config when available
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'),
  },
  ssr: false, // Disable SSR to avoid server-side storage issues
});

interface ClientWagmiProviderProps {
  children: ReactNode;
}

const ClientWagmiProvider: React.FC<ClientWagmiProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export default ClientWagmiProvider;