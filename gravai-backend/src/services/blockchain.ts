import { createPublicClient, http } from 'viem';
import { EventLog } from '../types';

const client = createPublicClient({
  chain: {
    id: 16600,
    name: '0G Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } },
  },
  transport: http(),
});

export async function fetchEvents(): Promise<EventLog[]> {
  const logs = await client.getLogs({
    fromBlock: 'latest',
    event: { type: 'event', name: 'Transfer' }, // Example: filter for Transfer events
  });
  return logs.map((log) => ({
    id: `${log.transactionHash}-${Date.now()}`,
    transactionHash: log.transactionHash,
    data: log.data,
    timestamp: Date.now(),
    eventName: 'Transfer',
    params: { from: log.args.from, to: log.args.to, value: log.args.value?.toString() },
  }));
}

export async function queryEvents(blockNumber?: string, address?: string): Promise<EventLog[]> {
  const logs = await client.getLogs({
    address: address as `0x${string}` | undefined,
    fromBlock: blockNumber ? BigInt(blockNumber) : undefined,
    toBlock: 'latest',
  });
  return logs.map((log) => ({
    id: `${log.transactionHash}-${Date.now()}`,
    transactionHash: log.transactionHash,
    data: log.data,
    timestamp: Date.now(),
    eventName: log.eventName || 'Unknown',
    params: log.args as Record<string, string>,
  }));
}

export function streamEvents(ws: any) {
  // Simulate real-time events (replace with 0G Chain WebSocket subscription)
  setInterval(async () => {
    const events = await fetchEvents();
    ws.send(JSON.stringify(events[0] || {}));
  }, 5000);
}