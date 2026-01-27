import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import eventRoutes from './api/routes/events';
import storageRoutes from './api/routes/storage';
import leaderboardRoutes from './api/routes/leaderboard';
import errorHandler from './api/middleware/errorHandler';
import { streamEvents } from './services/blockchain';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error Handling
app.use(errorHandler);

// WebSocket for real-time events
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  streamEvents(ws);
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));