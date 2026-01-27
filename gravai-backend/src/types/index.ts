export interface EventLog {
  id: string;
  transactionHash: string;
  data: string;
  timestamp: number;
  eventName?: string;
  params?: Record<string, string>;
}

export interface LeaderboardEntry {
  id: number;
  userAddress: string;
  prediction: number;
  type: string;
  timestamp: number;
}