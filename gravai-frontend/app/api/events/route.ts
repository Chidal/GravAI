import { NextResponse } from 'next/server';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = () => {
        const mockTx = {
          hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
          from: `0x${Math.random().toString(16).slice(2, 8)}`,
          to: `0x${Math.random().toString(16).slice(2, 8)}`,
          value: (Math.random() * 10).toFixed(4),
          gasUsed: Math.floor(Math.random() * 1000000).toString(),
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
        };
        controller.enqueue(`data: ${JSON.stringify(mockTx)}\n\n`);
      };

      const interval = setInterval(sendEvent, 3000);
      sendEvent();

      return () => clearInterval(interval);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}